import {
	CameraSmile01Icon,
	Cards01Icon,
	Move01Icon,
	Touch01Icon,
	VrGlassesIcon,
} from '@hugeicons/core-free-icons'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { BackHandler, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { CardCarousel } from '@/components/deck/CardCarousel'
import { CardStats } from '@/components/deck/CardStats'
import { CardViewerFrame } from '@/components/deck/CardViewerFrame'
import type { ViewerMode } from '@/components/deck/CardViewerScene'
import { RoundAction } from '@/components/deck/RoundAction'
import { ViewModeSwitch } from '@/components/deck/ViewModeSwitch'
import { Badge } from '@/components/ui/Badge'
import BackButton from '@/components/ui/BackButton'
import { Icon } from '@/components/ui/Icon'
import { QueryView } from '@/components/ui/QueryView'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import Toast from '@/components/ui/Toast'
import { useCards } from '@/hooks/useCards'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import { useViroExit } from '@/hooks/useViroHandoff'
import colors from '@/theme/colors'
import { markHintShown, wasHintShown } from '@/services/hints'
import type { OwnedCard } from '@/types/cards'
import { rarityLabel } from '@/utils/cards'

const noop = () => {}

// A-26 (card) and A-27 (model): one screen with a view switch and a
// carousel of the user's other cards.
export default function CardViewScreen() {
	// `mode` brings back the view the user had before opening AR.
	const { id, mode: initialMode } = useLocalSearchParams<{
		id: string
		mode?: ViewerMode
	}>()
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
	// The animal first; the card only when coming back to it from AR.
	const [mode, setMode] = useState<ViewerMode>(
		initialMode === 'card' ? 'card' : 'model',
	)
	const [playing, setPlaying] = useState(false)
	const [hintVisible, setHintVisible] = useState(false)
	// Heights of the controls over the viewer, to fit the subject between.
	const [overlayTop, setOverlayTop] = useState(0)
	const [overlayBottom, setOverlayBottom] = useState(0)
	// Leaving releases the 3D view first (see useViroHandoff).
	const [viewerBusy, setViewerBusy] = useState(false)
	const { exiting, exit } = useViroExit('scene3d', viewerBusy)
	const leave = useCallback(() => exit(() => router.back()), [exit])

	// Android back (button or gesture) leaves the same way as the back
	// button, so reopening a card right away can't overlap two Viro views.
	useFocusEffect(
		useCallback(() => {
			const subscription = BackHandler.addEventListener(
				'hardwareBackPress',
				() => {
					leave()
					return true
				},
			)

			return () => subscription.remove()
		}, [leave]),
	)

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
						<View style={{ flex: 1 }}>
							{/* The viewer fills the screen behind the controls, so a turned
							    model is never cut off by them. */}
							<View className='absolute inset-0'>
								{!exiting && (
									<CardViewerFrame
										card={card}
										mode={mode}
										playing={playing}
										onModelTap={togglePlaying}
										overlayTop={overlayTop}
										overlayBottom={overlayBottom}
										onBusyChange={setViewerBusy}
									/>
								)}
							</View>

							{/* Empty areas let touches through to the viewer. */}
							<View
								pointerEvents='box-none'
								className='absolute inset-0 justify-between'
								style={{ paddingBottom: insets.bottom + 16 }}
							>
								{/* HEADER: back + stats, and in A-27 the name and rarity */}
								<View
									pointerEvents='box-none'
									onLayout={(event) =>
										setOverlayTop(event.nativeEvent.layout.height)
									}
								>
									<View
										pointerEvents='box-none'
										className='flex-row items-center justify-between gap-3 px-5 pt-2'
									>
										<BackButton
											onPress={leave}
											position='relative'
											variant='outline'
										/>
										<CardStats stats={card.stats} variant='pill' />
									</View>

									{mode === 'model' && (
										<View
											pointerEvents='none'
											className='mt-4 items-center gap-2 px-5'
										>
											<Text
												className='text-h1 text-center'
												accessibilityRole='header'
											>
												{card.name}
											</Text>
											{/* Badge is self-start; its wrapper is what gets centered. */}
											<View>
												<Badge
													tone='success'
													label={rarityLabel(card.rarity)}
												/>
											</View>
										</View>
									)}
								</View>

								<View
									pointerEvents='box-none'
									onLayout={(event) =>
										setOverlayBottom(
											event.nativeEvent.layout.height + insets.bottom + 16,
										)
									}
								>
									<View
										pointerEvents='none'
										className='flex-row items-center justify-center gap-1.5'
									>
										<Icon icon={Move01Icon} size={16} color={colors.tinta2} />
										<Text className='text-meta'>
											{mode === 'model'
												? 'Arrastra para girar · toca para animar'
												: 'Arrastra para girar la tarjeta'}
										</Text>
									</View>

									{/* AR · view switch · selfie */}
									<View
										pointerEvents='box-none'
										className='mt-4 flex-row items-start justify-between px-5'
									>
										<RoundAction
											icon={VrGlassesIcon}
											label='Ver en AR'
											// Replace, not push: this screen's 3D view must be
											// released before the AR one starts (see useViroHandoff).
											onPress={() =>
												exit(() =>
													router.replace(`/deck/ar/${card.id}?mode=${mode}`),
												)
											}
										/>
										<ViewModeSwitch
											value={mode}
											onChange={setMode}
											className='mt-1'
										/>
										{/* Selfie isn't built yet. */}
										<RoundAction
											icon={CameraSmile01Icon}
											label='Selfie'
											onPress={noop}
										/>
									</View>

									<View pointerEvents='box-none' className='mt-5'>
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
