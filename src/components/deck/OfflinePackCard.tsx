import { router } from 'expo-router'

import { ListCard } from '@/components/ui/ListCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { usePackStatus } from '@/hooks/usePackStatus'
import { getPackSummary } from '@/utils/offlinePack'

type OfflinePackCardProps = {
	className?: string
}

// ZooDeck's "Paquete sin conexión" row: the pack's state in one line, and
// the way into its detail screen. Stands out (Hoja, solid icon) while it
// needs the user; quiet once everything is on the phone.
export function OfflinePackCard({ className = '' }: OfflinePackCardProps) {
	const status = usePackStatus()
	const summary = getPackSummary(status)

	return (
		<ListCard
			className={className}
			tone={summary.highlighted ? 'hoja' : 'default'}
			icon={summary.icon}
			iconTone={
				summary.kind === 'noSpace'
					? 'danger'
					: summary.highlighted
						? 'solid'
						: undefined
			}
			title='Paquete sin conexión'
			description={summary.text}
			onPress={() => router.push('/deck/offline')}
		>
			{summary.kind === 'downloading' ? (
				<ProgressBar
					progress={status.progress}
					size='sm'
					accessibilityLabel='Descarga del paquete'
				/>
			) : undefined}
		</ListCard>
	)
}
