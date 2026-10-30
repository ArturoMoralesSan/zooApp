import { cardShadow, ICON_COLOR } from '@/components/tickets/summaryStyles'
import { CreditCardIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { Text, View } from 'react-native'

export function PaymentMethodCard() {
	return (
		<View
			className='mb-3.5 w-full flex-row items-center rounded-[20px] border border-card-border bg-niebla p-4'
			style={cardShadow}
		>
			<View className='mr-3 h-[46px] w-[46px] items-center justify-center rounded-[14px] border border-card-border bg-hoja'>
				<HugeiconsIcon
					icon={CreditCardIcon}
					size={25}
					strokeWidth={1.8}
					color={ICON_COLOR}
				/>
			</View>

			<View className='flex-1'>
				<Text className='text-h3 text-tinta'>Método de pago</Text>
				<Text className='text-meta mt-1'>Tarjeta de crédito o débito</Text>
			</View>
		</View>
	)
}
