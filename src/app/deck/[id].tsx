import {
	CameraSmile01Icon,
	Cards01Icon,
	Touch01Icon,
	VrGlassesIcon,
} from '@hugeicons/core-free-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { CardCarousel } from '@/components/deck/CardCarousel'
import { CardStats } from '@/components/deck/CardStats'
import { CardViewerFrame } from '@/components/deck/CardViewerFrame'
import type { ViewerMode } from '@/components/deck/CardViewerScene'
import { RoundAction } from '@/components/deck/RoundAction'
import { ViewModeSwitch } from '@/components/deck/ViewModeSwitch'
import { Badge } from '@/components/ui/Badge'
import BackButton from '@/components/ui/BackButton'
import { QueryView } from '@/components/ui/QueryView'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import Toast from '@/components/ui/Toast'
import { useCards } from '@/hooks/useCards'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import { markHintShown, wasHintShown } from '@/services/hints'
import type { OwnedCard } from '@/types/cards'
import { rarityLabel } from '@/utils/cards'

const noop = () => {}

// A-26 (card) and A-27 (model): one screen with a view switch and a
// carousel of the user's other cards.
export default function CardViewScreen() {
	const { id } = useLocalSearchParams<{ id: string }>()
	const insets = useSafeAreaInsets()
	const cardsQuery = useCards()

	const owned = useMemo(
		() =>
			(cardsQuery.data ?? []).filter(
				(card): card is OwnedCard => card.encountered,
			),
		[cardsQuery.data],
	)

	// null until the user moves: then it follows the carousel.
	const [selected, setSelected] = useState<number | null>(null)
	const [mode, setMode] = useState<ViewerMode>('card')
	const [playing, setPlaying] = useState(false)
	const [hintVisible, setHintVisible] = useState(false)

	useSessionRedirect()

	const index =
		selected ??
		Math.max(
			0,
			owned.findIndex((card) => String(card.id) === id),
		)
	const card = owned[index]

	const togglePlaying = useCallback(() => setPlaying((value) => !value), [])

	const changeCard = (next: number) => {
		setSelected(next)
		// Each card starts still; a tap animates it.
		setPlaying(false)
	}

	// First time the animal is shown on this device: tell how to animate it.
	useEffect(() => {
		if (mode !== 'model' || !card?.model_url) return

		let cancelled = false

		void wasHintShown('deck_model_tap').then((shown) => {
			if (shown || cancelled) return

			setHintVisible(true)
			void markHintShown('deck_model_tap')
		})

		return () => {
			cancelled = true
		}
	}, [mode, card?.model_url])

	const hideHint = useCallback(() => setHintVisible(false), [])

	return (
		<ScreenBackground tone='niebla'>
			<QueryView
				query={cardsQuery}
				loadingMessage='Cargando tu tarjeta…'
				errorTitle='No pudimos cargar tu tarjeta'
				isEmpty={() => !card}
				empty={{
					icon: Cards01Icon,
					title: 'No encontramos esta tarjeta',
					message: 'Gana su duelo para verla en tu deck.',
				}}
				className='mx-5 mt-20'
			>
				{() =>
					card && (
						<View style={{ flex: 1, paddingBottom: insets.bottom + 16 }}>
							{/* HEADER: back + stats */}
							<View className='flex-row items-center justify-between gap-3 px-5 pt-2'>
								<BackButton
									onPress={() => router.back()}
									position='relative'
									variant='outline'
								/>
								<CardStats stats={card.stats} variant='pill' />
							</View>

							{/* A-27: name and rarity over the model */}
							{mode === 'model' && (
								<View className='mt-4 items-center gap-2 px-5'>
									<Text
										className='text-h1 text-center'
										accessibilityRole='header'
									>
										{card.name}
									</Text>
									<Badge tone='success' label={rarityLabel(card.rarity)} />
								</View>
							)}

							<View className='mt-2' style={{ flex: 1 }}>
								<CardViewerFrame
									card={card}
									mode={mode}
									playing={playing}
									onModelTap={togglePlaying}
								/>
							</View>

							{/* AR · view switch · selfie */}
							<View className='mt-4 flex-row items-start justify-between px-5'>
								{/* AR placement and selfie aren't built yet. */}
								<RoundAction
									icon={VrGlassesIcon}
									label='Ver en AR'
									onPress={noop}
								/>
								<ViewModeSwitch
									value={mode}
									onChange={setMode}
									className='mt-1'
								/>
								<RoundAction
									icon={CameraSmile01Icon}
									label='Selfie'
									onPress={noop}
								/>
							</View>

							<View className='mt-5'>
								<CardCarousel
									cards={owned}
									index={index}
									onChange={changeCard}
								/>
								<Text className='text-meta mt-3 text-center'>
									Desliza para ver tus otras tarjetas · {index + 1} de{' '}
									{owned.length}
								</Text>
							</View>
						</View>
					)
				}
			</QueryView>

			<Toast
				visible={hintVisible}
				icon={Touch01Icon}
				title='Toca el modelo'
				message={`Toca a ${card?.name ?? 'el animal'} para verlo en movimiento y vuelve a tocarlo para pausarlo.`}
				onHide={hideHint}
			/>
		</ScreenBackground>
	)
}
