import { Location01Icon } from '@hugeicons/core-free-icons'

import { Notice } from '@/components/ui/Notice'
import { TextLink } from '@/components/ui/TextLink'
import type { VisitReason } from '@/types/map'

type VisitNoticeProps = {
	reason: VisitReason
	onAllowLocation: () => void
	onBuyTicket: () => void
}

const copy: Record<VisitReason, { title: string; message: string }> = {
	location_required: {
		title: 'Activa tu ubicación',
		message: 'La usamos para saber si estás en el zoológico.',
	},
	outside_zoo: {
		title: 'Acércate al zoológico',
		message: 'Los duelos se juegan dentro del zoológico.',
	},
	no_ticket: {
		title: 'Necesitas un boleto para hoy',
		message: 'Con tu boleto del día puedes retar a los animales.',
	},
}

// Why no duel can start right now (A-17), with the way out when there is one.
export function VisitNotice({
	reason,
	onAllowLocation,
	onBuyTicket,
}: VisitNoticeProps) {
	return (
		<Notice
			tone='warning'
			title={copy[reason].title}
			message={copy[reason].message}
			icon={reason === 'outside_zoo' ? Location01Icon : undefined}
		>
			{reason === 'location_required' && (
				<TextLink label='Permitir ubicación' onPress={onAllowLocation} />
			)}
			{reason === 'no_ticket' && (
				<TextLink label='Comprar boleto' onPress={onBuyTicket} />
			)}
		</Notice>
	)
}
