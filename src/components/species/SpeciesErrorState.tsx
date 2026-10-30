import BackButton from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { IconBox } from '@/components/ui/IconBox'
import { Alert02Icon } from '@hugeicons/core-free-icons'
import { ImageBackground, Text, View } from 'react-native'

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

			<Card className='mt-6 items-center py-8'>
				<IconBox icon={Alert02Icon} size='lg' tone='danger' />

				<Text className='text-h2 mt-5 text-center text-tinta'>
					No fue posible cargar la especie
				</Text>

				<Text className='text-body mt-2 text-center text-tinta-2'>
					{error ?? 'La información no está disponible en este momento.'}
				</Text>

				<Button
					title='Intentar nuevamente'
					variant='secondary'
					onPress={onRetry}
					className='mt-4'
				/>
			</Card>
		</ImageBackground>
	)
}
