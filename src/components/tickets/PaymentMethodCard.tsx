import { ListCard } from '@/components/ui/ListCard'
import { CreditCardIcon } from '@hugeicons/core-free-icons'

export function PaymentMethodCard() {
	return (
		<ListCard
			icon={CreditCardIcon}
			title='Método de pago'
			description='Tarjeta de crédito o débito'
			className='mb-3'
		/>
	)
}
