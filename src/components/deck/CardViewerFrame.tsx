import { CubeIcon } from '@hugeicons/core-free-icons'
import { Viro3DSceneNavigator, type ViroScene } from '@reactvision/react-viro'
import { type ReactNode, useMemo, useState } from 'react'
import { ActivityIndicator, PanResponder, Text, View } from 'react-native'

import {
	CardViewerScene,
	type CardViewerSceneProps,
	SUBJECT_DISTANCE,
	type ViewerMode,
} from '@/components/deck/CardViewerScene'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'
import { useViroHandoff } from '@/hooks/useViroHandoff'
import type { OwnedCard } from '@/types/cards'

type CardViewerFrameProps = {
	card: OwnedCard
	mode: ViewerMode
	playing: boolean
	onModelTap: () => void
	// Height of the controls drawn over the viewer at the top and bottom:
	// the subject is sized and centered in the space between them.
	overlayTop: number
	overlayBottom: number
}

type ModelStatus = 'loading' | 'ready' | 'error'

type Rotation = [number, number]

// Every rotation the user left a card or model in (key: card + mode), plus
// where the current drag started.
type Turns = {
	rotations: Record<string, Rotation>
	dragFrom: Rotation | null
}

// Drag sensitivity in degrees per pixel; pitch is clamped so the object
// never flips upside down.
const YAW_PER_PX = 0.5
const PITCH_PER_PX = 0.35
const MAX_PITCH = 60
// A touch that moves less than this is a tap (play/pause), not a drag.
const TAP_SLOP = 8
const NO_ROTATION: Rotation = [0, 0]
// Animals face the camera head-on, which hides their length: start them
// at three quarters, closer to A-27's side view.
const MODEL_START: Rotation = [0, -40]
// Share of the free space each subject fills: the card's height, and the
// animal's largest side (it turns, so it needs room on every side).
const CARD_FILL = 0.8
const MODEL_FILL = 0.95
// Card width / height (5.72 × 10.16 cm).
const CARD_ASPECT = 0.563
// Viro's default 90° vertical field of view: tan(45°).
const FOV_TAN = 1

const noop = () => {}

// The 3D viewer, filling its parent behind the screen's controls, with its
// states: loader while the animal loads, a notice when the card has no
// model or it fails.
export function CardViewerFrame({
	card,
	mode,
	playing,
	onModelTap,
	overlayTop,
	overlayBottom,
}: CardViewerFrameProps) {
	// Status per model URL, so switching cards starts from "loading".
	const [status, setStatus] = useState<{ url: string; value: ModelStatus }>()
	// Remounts the viewer to retry a failed model.
	const [attempt, setAttempt] = useState(0)
	const [size, setSize] = useState<{ width: number; height: number }>()
	const viroReady = useViroHandoff()

	const viewKey = `${card.id}-${mode}`
	const start = mode === 'model' ? MODEL_START : NO_ROTATION
	const [turns, setTurns] = useState<Turns>({ rotations: {}, dragFrom: null })
	const rotation = turns.rotations[viewKey] ?? start

	// Dragging turns the object (yaw and pitch); a tap plays or pauses the
	// animal. Viro's orbit camera ignores touch outside AR, and its onClick
	// can't fire under this gesture layer, so both are handled here. Every
	// update derives from the previous state, so a drag always continues
	// from where the object is, even if Android cancels a gesture midway.
	const panResponder = useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: () => true,
				onMoveShouldSetPanResponder: () => true,
				// Keep the gesture: losing it midway would drop the rotation.
				onPanResponderTerminationRequest: () => false,
				onPanResponderGrant: () =>
					setTurns((previous) => ({
						...previous,
						dragFrom: previous.rotations[viewKey] ?? start,
					})),
				onPanResponderMove: (_event, gesture) =>
					setTurns((previous) => {
						const [pitch, yaw] =
							previous.dragFrom ?? previous.rotations[viewKey] ?? start
						const nextPitch = Math.max(
							-MAX_PITCH,
							Math.min(MAX_PITCH, pitch + gesture.dy * PITCH_PER_PX),
						)

						return {
							...previous,
							rotations: {
								...previous.rotations,
								[viewKey]: [nextPitch, yaw + gesture.dx * YAW_PER_PX],
							},
						}
					}),
				onPanResponderRelease: (_event, gesture) => {
					setTurns((previous) => ({ ...previous, dragFrom: null }))

					const tapped =
						Math.abs(gesture.dx) < TAP_SLOP && Math.abs(gesture.dy) < TAP_SLOP

					if (tapped && mode === 'model') onModelTap()
				},
				onPanResponderTerminate: () =>
					setTurns((previous) => ({ ...previous, dragFrom: null })),
			}),
		[viewKey, start, mode, onModelTap],
	)

	// World units per pixel at the subject's distance, then the subject's
	// sizes and offset so it sits in the free space between the overlays.
	const layout = useMemo(() => {
		if (!size) return null

		const worldPerPx = (2 * SUBJECT_DISTANCE * FOV_TAN) / size.height
		const freeHeight = Math.max(0, size.height - overlayTop - overlayBottom)
		const freeCenter = overlayTop + freeHeight / 2

		return {
			cardHeight:
				Math.min(freeHeight, size.width / CARD_ASPECT) * CARD_FILL * worldPerPx,
			modelSize: Math.min(freeHeight, size.width) * MODEL_FILL * worldPerPx,
			offsetY: -(freeCenter - size.height / 2) * worldPerPx,
			freeTop: overlayTop,
			freeHeight,
		}
	}, [size, overlayTop, overlayBottom])

	const modelUrl = card.model_url
	const modelStatus: ModelStatus =
		status?.url === modelUrl ? status.value : 'loading'

	const sceneProps = useMemo<CardViewerSceneProps>(
		() => ({
			mode,
			cardImageUrl: card.card_image_url ?? card.thumbnail_image,
			modelUrl,
			playing,
			rotation,
			cardHeight: layout?.cardHeight ?? 1,
			modelSize: layout?.modelSize ?? 1,
			offsetY: layout?.offsetY ?? 0,
			onModelReady: () =>
				modelUrl && setStatus({ url: modelUrl, value: 'ready' }),
			onModelError: () =>
				modelUrl && setStatus({ url: modelUrl, value: 'error' }),
		}),
		[mode, card, modelUrl, playing, rotation, layout],
	)

	const showModelState = mode === 'model'

	return (
		<View
			{...panResponder.panHandlers}
			onLayout={(event) => {
				const { width, height } = event.nativeEvent.layout
				setSize({ width, height })
			}}
			accessibilityHint={
				mode === 'model'
					? 'Arrastra para girarlo, toca para animarlo'
					: 'Arrastra para girar la tarjeta'
			}
			style={{ flex: 1 }}
		>
			{/* Sized from the layout (rendering before it would jump), and only
			    once a previous Viro view has been released. */}
			{layout && viroReady && (
				<Viro3DSceneNavigator
					key={attempt}
					// Typed as the ViroScene class, but it renders any scene component.
					initialScene={{ scene: CardViewerScene as unknown as ViroScene }}
					viroAppProps={sceneProps}
					// PBR/HDR for the GLB materials, antialiasing for the card's
					// edges; no extras that cost frames.
					pbrEnabled
					hdrEnabled
					multisamplingEnabled
					bloomEnabled={false}
					shadowsEnabled={false}
					debug={false}
					onExitViro={noop}
					style={{ flex: 1 }}
				/>
			)}

			{showModelState && !modelUrl && (
				<ViewerOverlay layout={layout}>
					<Icon icon={CubeIcon} size={32} color={colors.apagado} />
					<Text className='text-body mt-2 text-center text-tinta-2'>
						Esta tarjeta aún no tiene modelo 3D.
					</Text>
				</ViewerOverlay>
			)}

			{showModelState && modelUrl && modelStatus === 'loading' && (
				<ViewerOverlay layout={layout}>
					<ActivityIndicator size='large' color={colors.esmeralda} />
					<Text className='text-meta mt-2'>Cargando a {card.name}…</Text>
				</ViewerOverlay>
			)}

			{showModelState && modelUrl && modelStatus === 'error' && (
				<ViewerOverlay layout={layout} interactive>
					<Text className='text-body mb-3 text-center text-tinta-2'>
						No pudimos cargar a {card.name}.
					</Text>
					<Button
						title='Reintentar'
						size='sm'
						fullWidth={false}
						onPress={() => {
							setStatus(undefined)
							setAttempt((value) => value + 1)
						}}
					/>
				</ViewerOverlay>
			)}
		</View>
	)
}

type ViewerOverlayProps = {
	children: ReactNode
	// Free space between the screen's controls, to center the content in.
	layout: { freeTop: number; freeHeight: number } | null
	// Lets taps reach the overlay (retry button); otherwise they go to the
	// viewer underneath.
	interactive?: boolean
}

function ViewerOverlay({
	children,
	layout,
	interactive = false,
}: ViewerOverlayProps) {
	return (
		<View
			pointerEvents={interactive ? 'auto' : 'none'}
			className='absolute left-0 right-0 items-center justify-center px-8'
			// Placed in the measured free space, not the whole viewer.
			style={
				layout
					? { top: layout.freeTop, height: layout.freeHeight }
					: { top: 0, bottom: 0 }
			}
		>
			{children}
		</View>
	)
}
