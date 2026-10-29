import type {
	CreateDonationResponse,
	Donation,
	DonationsResponse,
} from '@/types/donations'

import { api } from './api'

export const donationsKeys = {
	list: '/donations',
}

export async function getDonations(): Promise<Donation[]> {
	const response = await api<DonationsResponse>(donationsKeys.list)

	let result: unknown = Array.isArray(response)
		? response
		: (response?.data ?? response)

	if (result && typeof result === 'object' && !Array.isArray(result)) {
		const payload = result as {
			data?: unknown
			donations?: unknown
		}

		if (Array.isArray(payload.data)) {
			result = payload.data
		} else if (Array.isArray(payload.donations)) {
			result = payload.donations
		}
	}

	return Array.isArray(result) ? (result as Donation[]) : []
}

export async function createDonation(body: {
	amount: number
}): Promise<Donation> {
	const response = await api<CreateDonationResponse>(donationsKeys.list, {
		method: 'POST',
		body: JSON.stringify(body),
	})

	const donation = response?.data?.donation ?? response?.donation

	if (!donation) {
		throw new Error(
			response?.message ?? 'No fue posible registrar la donación.',
		)
	}

	return donation
}
