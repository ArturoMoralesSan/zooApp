import type { CreditsSection } from '@/types/credits'

import { CREDITS_DRAFT } from './creditsDraft'

export const creditsKeys = {
	list: '/v1/credits',
}

// Draft: answers with the API doc's example. Connecting it is
// `(await api<CreditsResponse>(creditsKeys.list)).data`.
export async function getCredits(): Promise<CreditsSection[]> {
	return CREDITS_DRAFT.data
}
