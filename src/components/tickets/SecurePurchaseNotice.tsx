import { ListCard } from '@/components/ui/ListCard'
import { SecurityCheckIcon } from '@hugeicons/core-free-icons'

export function SecurePurchaseNotice() {
	return (
		<ListCard
			tone='hoja'
			icon={SecurityCheckIcon}
			iconTone='solid'
			title='Compra segura'
			description='Al confirmar recibirás tus boletos digitales con su código QR.'
			className='mb-3'
		/>
	)
}
