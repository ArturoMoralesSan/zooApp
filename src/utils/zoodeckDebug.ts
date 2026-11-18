import { Image } from 'react-native'

import cardTestImage from '@/assets/models/card_test.png'
import modelTest from '@/assets/models/model_test.glb'
import type {
	DuelAnswer,
	DuelPoints,
	DuelStart,
	DuelSubmitResponse,
	OwnedCard,
} from '@/types/cards'

// Debug duel (EXPO_PUBLIC_ZOODECK_QUIZ_DEBUG=1): a fake quiz, without QR or
// AR, that ends in the real 3D view with a fake card. Graded here, never
// sent to the API.
export const ZOODECK_QUIZ_DEBUG =
	process.env.EXPO_PUBLIC_ZOODECK_QUIZ_DEBUG === '1'

// EXPO_PUBLIC_ZOODECK_VISIT_CHECKS=0 lets duels be tested away from the zoo:
// the app stops asking for location for duels and visit reasons (location,
// outside the zoo, no ticket) no longer disable anything. The server still
// decides with its own APP_ZOODECK_ENFORCE_VALIDATIONS flag.
export const ZOODECK_VISIT_CHECKS =
	process.env.EXPO_PUBLIC_ZOODECK_VISIT_CHECKS !== '0'

// Stands in for the scanned QR; the duel session uses it to spot the debug
// duel.
export const DEBUG_DUEL_CODE = 'zoodeck-debug'

// Bundled assets served by Metro, as URLs like the API's.
const assetUrl = (asset: number) => Image.resolveAssetSource(asset).uri

export const DEBUG_CARD: OwnedCard = {
	id: -1,
	encountered: true,
	name: 'Animal de prueba',
	rarity: 'rara',
	category_name: 'Depuración',
	thumbnail_image: assetUrl(cardTestImage),
	card_image_url: assetUrl(cardTestImage),
	stats: { astucia: 50, rapidez: 50, fuerza: 50 },
	model_url: assetUrl(modelTest),
}

const MAX_ATTEMPTS = 3

// Correct option per question, so any outcome can be tested on purpose.
const CORRECT: Record<number, number> = { 1: 11, 2: 22 }

export function createDebugDuel(attemptsLeft = MAX_ATTEMPTS): DuelStart {
	return {
		attempt_id: -1,
		attempts: { max: MAX_ATTEMPTS, left: attemptsLeft, locked_until: null },
		card: {
			name: DEBUG_CARD.name,
			rarity: DEBUG_CARD.rarity,
			category_name: DEBUG_CARD.category_name,
			thumbnail_image: DEBUG_CARD.thumbnail_image,
			stats: DEBUG_CARD.stats,
			model_url: DEBUG_CARD.model_url,
		},
		questions: [
			{
				id: 1,
				question: 'Pregunta de prueba 1: elige la opción correcta.',
				answers: [
					{ id: 10, answer: 'Incorrecta' },
					{ id: 11, answer: 'Correcta' },
					{ id: 12, answer: 'Incorrecta' },
				],
			},
			{
				id: 2,
				question: 'Pregunta de prueba 2: elige la opción correcta.',
				answers: [
					{ id: 21, answer: 'Incorrecta' },
					{ id: 22, answer: 'Correcta' },
				],
			},
		],
	}
}

// Fake capture points, one case per debug win in turn, so every A-22 state
// can be checked: points, level up, disabled rule (0) and an older server.
const DEBUG_POINTS: (DuelPoints | null)[] = [
	{
		awarded: 50,
		total: 320,
		level: { id: 1, name: 'Bronce' },
		level_up: false,
	},
	{ awarded: 100, total: 500, level: { id: 2, name: 'Plata' }, level_up: true },
	{ awarded: 0, total: 500, level: { id: 2, name: 'Plata' }, level_up: false },
	null,
]
let debugWins = 0

// Same rules as the server: won only if every answer is right; otherwise
// one attempt is used, and the last one locks with the review.
export function gradeDebugDuel(
	duel: DuelStart,
	answers: DuelAnswer[],
): DuelSubmitResponse {
	const results = answers.map((answer) => ({
		question_id: answer.question_id,
		is_correct: CORRECT[answer.question_id] === answer.answer_id,
	}))
	const right = results.filter((item) => item.is_correct).length

	if (right === results.length) {
		return {
			success: true,
			message: '¡Ganaste el duelo de prueba!',
			data: {
				outcome: 'won',
				results,
				attempts: null,
				review: null,
				card: DEBUG_CARD,
				points: DEBUG_POINTS[debugWins++ % DEBUG_POINTS.length],
			},
		}
	}

	const left = duel.attempts.left - 1
	const locked = left <= 0

	return {
		success: true,
		message: `Acertaste ${right} de ${results.length}.${locked ? ' Ya no te quedan intentos.' : ''}`,
		data: {
			outcome: locked ? 'locked' : 'retry',
			results,
			attempts: {
				max: duel.attempts.max,
				left: Math.max(0, left),
				locked_until: locked
					? new Date(Date.now() + 10 * 60 * 1000).toISOString()
					: null,
			},
			review: locked
				? duel.questions.map((question) => ({
						question_id: question.id,
						correct_answer_id: CORRECT[question.id],
					}))
				: null,
			card: null,
		},
	}
}
