import BackButton from '@/components/ui/BackButton'
import { cardShadow } from '@/components/species/speciesStyles'
import colors from '@/theme/colors'
import { UserGroupIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { ImageBackground, Pressable, Text, View } from 'react-native'

type SpeciesErrorStateProps = {
	error: string | null
	onBack: () => void
	onRetry: () => void
}

export function SpeciesErrorState({
	error,
	onBack,
	onRetry,
}: SpeciesErrorStateProps) {
	return (
		<ImageBackground
			source={require('@/assets/images/zoo-pattern.png')}
			className='flex-1 bg-blanco px-4 pt-14'
			resizeMode='repeat'
			imageClassName='opacity-90'
		>
			<View className='z-[100]' style={{ elevation: 100 }}>
				<BackButton onPress={onBack} />
			</View>

			<View
				className='items-center rounded-[28px] border border-card-border bg-niebla px-6 py-10'
				style={cardShadow}
			>
				<View className='h-16 w-16 items-center justify-center rounded-2xl border border-card-border bg-hoja'>
					<HugeiconsIcon
						icon={UserGroupIcon}
						size={34}
						strokeWidth={1.8}
						color={colors.tinta}
					/>
				</View>

				<Text className='text-h2 mt-5 text-center text-tinta'>
					No fue posible cargar la especie
				</Text>

				<Text className='text-body mt-2 text-center text-tinta-2'>
					{error ?? 'La información no está disponible en este momento.'}
				</Text>

				<Pressable
					onPress={onRetry}
					className='mt-3.5 self-start rounded-[20px] bg-esmeralda px-5 py-3 active:bg-bosque'
				>
					<Text className='text-button text-blanco'>Intentar nuevamente</Text>
				</Pressable>
			</View>
		</ImageBackground>
	)
}
