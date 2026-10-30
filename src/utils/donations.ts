import type { BadgeTone } from '@/components/ui/Badge'
import type { Donation } from '@/types/donations'

export function getDonationStatus(donation: Donation): string {
	const status = String(donation.status ?? '').toLowerCase()

	switch (status) {
		case 'completed':
		case 'complete':
		case 'completada':
		case 'completado':
			return 'Completada'

		case 'pending':
		case 'pendiente':
			return 'Pendiente'

		case 'cancelled':
		case 'canceled':
		case 'cancelado':
		case 'cancelada':
			return 'Cancelada'

		case 'failed':
		case 'fallida':
		case 'fallido':
			return 'Fallida'

		default:
			return donation.status || 'Registrada'
	}
}

export function getDonationStatusTone(donation: Donation): BadgeTone {
	const status = String(donation.status ?? '').toLowerCase()

	if (
		[
			'cancelled',
			'canceled',
			'cancelado',
			'cancelada',
			'failed',
			'fallida',
			'fallido',
		].includes(status)
	) {
		return 'error'
	}

	if (status === 'pending' || status === 'pendiente') {
		return 'pending'
	}

	return 'success'
}

export function isCompleted(donation: Donation): boolean {
	return ['completed', 'complete', 'completada', 'completado'].includes(
		String(donation.status ?? '').toLowerCase(),
	)
}
