import { UserGroupIcon } from '@hugeicons/core-free-icons'

import Toast from '@/components/ui/Toast'

type SeasonDismissedToastProps = {
	visible: boolean
	onHide: () => void
}

// After closing the season banner on a tab other than MiZoo: the details
// stay in MiZoo's level card. MiZoo's tab icon, so it's easy to spot.
export function SeasonDismissedToast({
	visible,
	onHide,
}: SeasonDismissedToastProps) {
	return (
		<Toast
			visible={visible}
			icon={UserGroupIcon}
			title='Aviso cerrado'
			message='Puedes ver los cambios de la temporada en MiZoo, en tu nivel.'
			onHide={onHide}
		/>
	)
}
