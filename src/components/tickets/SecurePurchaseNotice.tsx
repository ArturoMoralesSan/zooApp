import { Text, View } from 'react-native'

export function SecurePurchaseNotice() {
	return (
		<View className='mb-3.5 w-full flex-row items-center rounded-2xl border border-card-border bg-niebla p-3.5'>
			<View className='mr-3 h-[34px] w-[34px] items-center justify-center rounded-[11px] bg-esmeralda'>
				<Text className='font-sans-x text-[18px] text-blanco'>✓</Text>
			</View>

			<View className='flex-1'>
				<Text className='font-sans-bold text-[14px] text-tinta'>
					Compra segura
				</Text>
				<Text className='text-meta mt-1'>
					Al confirmar recibirás tus boletos digitales con su código QR.
				</Text>
			</View>
		</View>
	)
}
