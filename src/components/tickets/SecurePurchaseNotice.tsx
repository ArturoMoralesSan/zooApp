import { Text, View } from 'react-native'

export function SecurePurchaseNotice() {
	return (
		<View className='mb-3.5 w-full flex-row items-center rounded-2xl border border-card-border bg-niebla p-3.5'>
			<View className='mr-3 h-[34px] w-[34px] items-center justify-center rounded-[11px] bg-esmeralda'>
				<Text className='text-[18px] font-extrabold text-blanco'>✓</Text>
			</View>

			<View className='flex-1'>
				<Text className='text-[14px] font-bold text-tinta'>Compra segura</Text>
				<Text className='mt-1 text-[12px] leading-[18px] text-tinta-2'>
					Al confirmar recibirás tus boletos digitales con su código QR.
				</Text>
			</View>
		</View>
	)
}
