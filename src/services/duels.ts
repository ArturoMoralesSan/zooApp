import type {
	Attempts,
	DuelAnswer,
	DuelStart,
	DuelStartResponse,
	DuelSubmitResponse,
	OwnedCard,
} from '@/types/cards'
import type { VisitReason } from '@/types/map'

import { api, ApiError } from './api'

// What scanning a QR leads to. Only network errors and unexpected statuses
// are thrown; the expected refusals come back as a result to show.
export type DuelStartResult =
	| { kind: 'started'; duel: DuelStart }
	| { kind: 'owned'; message: string; card: OwnedCard }
	| { kind: 'locked'; message: string; attempts: Attempts }
	| { kind: 'unavailable'; message: string }
	// The visit checks: no location, outside the zoo or no ticket for today.
	| { kind: 'visit'; message: string; reason: VisitReason }

const VISIT_REASONS: VisitReason[] = [
	'location_required',
	'outside_zoo',
	'no_ticket',
]

// The visit refusal of a duel request (422 location_required, 403 outside
// the zoo or no ticket), if that's what the error is.
function visitReason(error: unknown): VisitReason | null {
	if (!(error instanceof ApiError)) return null

	const reason = (error.data as { reason?: unknown } | undefined)?.reason

	return VISIT_REASONS.find((item) => item === reason) ?? null
}

export async function startDuel(
	code: string,
	coordinates?: Coordinates | null,
): Promise<DuelStartResult> {
	try {
		const response = await api<DuelStartResponse>('/duels', {
			method: 'POST',
			body: JSON.stringify({ code, ...coordinates }),
		})

		return { kind: 'started', duel: response.data }
	} catch (error) {
		if (!(error instanceof ApiError)) throw error

		// Before the 422 branch below: location_required is a 422 too.
		const reason = visitReason(error)

		if (reason) {
			return { kind: 'visit', message: error.message, reason }
		}

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
