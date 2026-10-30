import colors from '@/theme/colors'
import { ArrowRight01Icon, Logout01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'

type LogoutCardProps = {
	loggingOut: boolean
	onLogout: () => void
}

export function LogoutCard({ loggingOut, onLogout }: LogoutCardProps) {
	return (
		<View className='mt-4 overflow-hidden rounded-[18px] border-1.5 border-card-border bg-niebla'>
			<Pressable
				onPress={onLogout}
				disabled={loggingOut}
				className='min-h-20 flex-row items-center px-3 py-2.5 active:opacity-[0.84]'
			>
				<View className='h-11 w-11 items-center justify-center rounded-[16px] border border-card-border bg-hoja'>
					<HugeiconsIcon
						icon={Logout01Icon}
						size={23}
						strokeWidth={1.8}
						color={colors.esmeralda}
					/>
				</View>

				<View className='ml-2.5 flex-1'>
					<Text className='text-h3 text-tinta'>
						{loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
					</Text>

					<Text className='text-meta mt-1 text-tinta'>Salir de tu cuenta</Text>
				</View>

				{loggingOut ? (
					<ActivityIndicator size='small' color={colors.esmeralda} />
				) : (
					<View className='ml-2 h-7 w-7 items-center justify-center rounded-full bg-esmeralda'>
						<HugeiconsIcon
							icon={ArrowRight01Icon}
							size={20}
							strokeWidth={2}
							color={colors.blanco}
						/>
					</View>
				)}
			</Pressable>
		</View>
	)
}
