import { Cards01Icon, QrCodeScanIcon } from '@hugeicons/core-free-icons'
import type { ReactNode } from 'react'
import { Text, View, type LayoutChangeEvent } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button } from '@/components/ui/Button'

type DuelSheetProps = {
	// Visit notice and selected animal, between the intro and the buttons.
	children: ReactNode
	canScan: boolean
	onOpenDeck: () => void
	onScan: () => void
	// The map centers its targets above the sheet.
	onLayout?: (event: LayoutChangeEvent) => void
}

// A-17 bottom sheet: "Reta a los animales", the selected animal and the
// "Mi Deck" / "Escanear QR" actions. Same sheet as the map's RouteCard.
export function DuelSheet({
	children,
	canScan,
	onOpenDeck,
	onScan,
	onLayout,
}: DuelSheetProps) {
	const insets = useSafeAreaInsets()

	return (
		<View
			className='absolute bottom-0 left-0 right-0 rounded-t-3xl border-1.5 border-b-0 border-card-border bg-blanco px-5 pt-3'
			style={{ paddingBottom: insets.bottom + 20 }}
			onLayout={onLayout}
		>
			<View className='mb-4 h-1 w-10 self-center rounded-full bg-card-border' />

			<Text className='text-h2 text-tinta'>Reta a los animales</Text>

			<Text className='text-body mt-1 text-tinta-2'>
				Encuentra su recinto, escanea el QR de la placa y gana su tarjeta.
			</Text>

			<View className='mt-4 gap-3'>{children}</View>

			<View className='mt-4 flex-row gap-3'>
				<View className='flex-1'>
					<Button
						title='Mi Deck'
						variant='secondary'
						icon={Cards01Icon}
						iconPosition='leading'
						onPress={onOpenDeck}
					/>
				</View>

				<View className='flex-1'>
					<Button
						title='Escanear QR'
						icon={QrCodeScanIcon}
						iconPosition='leading'
						onPress={onScan}
						disabled={!canScan}
					/>
				</View>
			</View>
		</View>
	)
}
