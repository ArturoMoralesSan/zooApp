import { describe, expect, test } from '@jest/globals'

import {
	createDebugDuel,
	DEBUG_CARD,
	gradeDebugDuel,
} from '@/utils/zoodeckDebug'

// The debug duel (EXPO_PUBLIC_ZOODECK_QUIZ_DEBUG=1) grades with the server's
// rules, so every result screen can be reached without a QR or backend.
describe('gradeDebugDuel', () => {
	const right = [
		{ question_id: 1, answer_id: 11 },
		{ question_id: 2, answer_id: 22 },
	]
	const oneWrong = [
		{ question_id: 1, answer_id: 11 },
		{ question_id: 2, answer_id: 21 },
	]

	test('every answer right wins the debug card', () => {
		const { data } = gradeDebugDuel(createDebugDuel(), right)

		expect(data).toMatchObject({
			outcome: 'won',
			card: DEBUG_CARD,
			attempts: null,
			review: null,
		})
		expect(data.results.every((result) => result.is_correct)).toBe(true)
	})

	test('a wrong answer uses one attempt', () => {
		const response = gradeDebugDuel(createDebugDuel(3), oneWrong)

		expect(response.message).toBe('Acertaste 1 de 2.')
		expect(response.data).toMatchObject({
			outcome: 'retry',
			card: null,
			review: null,
			attempts: { max: 3, left: 2, locked_until: null },
		})
	})

	test('the last attempt locks the card and reveals the answers', () => {
		const { data, message } = gradeDebugDuel(createDebugDuel(1), oneWrong)

		expect(message).toBe('Acertaste 1 de 2. Ya no te quedan intentos.')
		expect(data.outcome).toBe('locked')
		expect(data.attempts).toMatchObject({ left: 0 })
		expect(data.attempts?.locked_until).not.toBeNull()
		expect(data.review).toEqual([
			{ question_id: 1, correct_answer_id: 11 },
			{ question_id: 2, correct_answer_id: 22 },
		])
	})
})

describe('createDebugDuel', () => {
	test('starts with the attempts left', () => {
		expect(createDebugDuel(2).attempts).toEqual({
			max: 3,
			left: 2,
			locked_until: null,
		})
		expect(createDebugDuel().questions).toHaveLength(2)
	})
})
