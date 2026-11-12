import type {
	Attempts,
	DuelAnswer,
	DuelStart,
	DuelStartResponse,
	DuelSubmitResponse,
	OwnedCard,
} from '@/types/cards'

import { api, ApiError } from './api'

// What scanning a QR leads to. Only network errors and unexpected statuses
// are thrown; the expected refusals come back as a result to show.
export type DuelStartResult =
	| { kind: 'started'; duel: DuelStart }
	| { kind: 'owned'; message: string; card: OwnedCard }
	| { kind: 'locked'; message: string; attempts: Attempts }
	| { kind: 'unavailable'; message: string }

export async function startDuel(code: string): Promise<DuelStartResult> {
	try {
		const response = await api<DuelStartResponse>('/duels', {
			method: 'POST',
			body: JSON.stringify({ code }),
		})

		return { kind: 'started', duel: response.data }
	} catch (error) {
		if (!(error instanceof ApiError)) throw error

		const data = error.data as
			{ card?: OwnedCard; attempts?: Attempts } | undefined

		if (error.status === 409 && data?.card) {
			return { kind: 'owned', message: error.message, card: data.card }
		}

		if (error.status === 423 && data?.attempts) {
			return { kind: 'locked', message: error.message, attempts: data.attempts }
		}

		// Unknown or disabled QR, expired QR, card without questions.
		if ([404, 410, 422].includes(error.status)) {
			return { kind: 'unavailable', message: error.message }
		}

		throw error
	}
}

export type Coordinates = {
	latitude: number
	longitude: number
}

// 201 = won, 200 = failed; `data.outcome` says which. Grading errors
// (409 already submitted, 422 answers don't match) are thrown as ApiError.
export async function submitDuel(
	attemptId: number,
	answers: DuelAnswer[],
	coordinates?: Coordinates | null,
): Promise<DuelSubmitResponse> {
	return api<DuelSubmitResponse>(`/duels/${attemptId}/submit`, {
		method: 'POST',
		body: JSON.stringify({ answers, ...coordinates }),
	})
}
