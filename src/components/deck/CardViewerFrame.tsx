import { CubeIcon, Move01Icon } from '@hugeicons/core-free-icons'
import { Viro3DSceneNavigator, type ViroScene } from '@reactvision/react-viro'
import { type ReactNode, useMemo, useState } from 'react'
import { ActivityIndicator, PanResponder, Text, View } from 'react-native'

import {
	CardViewerScene,
	type CardViewerSceneProps,
	type ViewerMode,
} from '@/components/deck/CardViewerScene'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'
import type { OwnedCard } from '@/types/cards'

type CardViewerFrameProps = {
	card: OwnedCard
	mode: ViewerMode
	playing: boolean
	onModelTap: () => void
}

type ModelStatus = 'loading' | 'ready' | 'error'

type Rotation = [number, number]

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

const noop = () => {}

// The 3D viewer with its states: loader while the animal loads, a notice
// when the card has no model or it fails, and the drag hint underneath.
export function CardViewerFrame({
	card,
	mode,
	playing,
	onModelTap,
}: CardViewerFrameProps) {
	// Status per model URL, so switching cards starts from "loading".
	const [status, setStatus] = useState<{ url: string; value: ModelStatus }>()
	// Remounts the viewer to retry a failed model.
	const [attempt, setAttempt] = useState(0)
	// Rotation per card and mode, so each one starts facing the camera.
	// `base` is where the last drag ended; `live` follows the current one.
	const viewKey = `${card.id}-${mode}`
	const start = mode === 'model' ? MODEL_START : NO_ROTATION
	const [turn, setTurn] = useState<{
		key: string
		base: Rotation
		live: Rotation
	}>()
	const rotation = turn?.key === viewKey ? turn.live : start

	// Dragging turns the object (yaw and pitch); a tap plays or pauses the
	// animal. Viro's orbit camera ignores touch outside AR, and its onClick
	// can't fire under this gesture layer, so both are handled here.
	const panResponder = useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: () => true,
				onMoveShouldSetPanResponder: () => true,
				onPanResponderMove: (_event, gesture) =>
					setTurn((previous) => {
						const base = previous?.key === viewKey ? previous.base : start
						const pitch = Math.max(
							-MAX_PITCH,
							Math.min(MAX_PITCH, base[0] + gesture.dy * PITCH_PER_PX),
						)

						return {
							key: viewKey,
							base,
							live: [pitch, base[1] + gesture.dx * YAW_PER_PX],
						}
					}),
				onPanResponderRelease: (_event, gesture) => {
					const tapped =
						Math.abs(gesture.dx) < TAP_SLOP && Math.abs(gesture.dy) < TAP_SLOP

					if (tapped) {
						if (mode === 'model') onModelTap()
						return
					}

					setTurn((previous) =>
						previous?.key === viewKey
							? { ...previous, base: previous.live }
							: previous,
					)
				},
			}),
		[viewKey, start, mode, onModelTap],
	)

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
			onModelReady: () =>
				modelUrl && setStatus({ url: modelUrl, value: 'ready' }),
			onModelError: () =>
				modelUrl && setStatus({ url: modelUrl, value: 'error' }),
		}),
		[mode, card, modelUrl, playing, rotation],
	)

	const showModelState = mode === 'model'

	return (
		<View style={{ flex: 1 }}>
			<View
				{...panResponder.panHandlers}
				accessibilityHint={
					mode === 'model'
						? 'Arrastra para girarlo, toca para animarlo'
						: 'Arrastra para girar la tarjeta'
				}
				className='overflow-hidden'
				style={{ flex: 1 }}
			>
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

				{showModelState && !modelUrl && (
					<ViewerOverlay>
						<Icon icon={CubeIcon} size={32} color={colors.apagado} />
						<Text className='text-body mt-2 text-center text-tinta-2'>
							Esta tarjeta aún no tiene modelo 3D.
						</Text>
					</ViewerOverlay>
				)}

				{showModelState && modelUrl && modelStatus === 'loading' && (
					<ViewerOverlay>
						<ActivityIndicator size='large' color={colors.esmeralda} />
						<Text className='text-meta mt-2'>Cargando a {card.name}…</Text>
					</ViewerOverlay>
				)}

				{showModelState && modelUrl && modelStatus === 'error' && (
					<ViewerOverlay interactive>
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

			<View className='mt-2 flex-row items-center justify-center gap-1.5'>
				<Icon icon={Move01Icon} size={16} color={colors.tinta2} />
				<Text className='text-meta'>
					{mode === 'model'
						? 'Arrastra para girar · toca para animar'
						: 'Arrastra para girar la tarjeta'}
				</Text>
			</View>
		</View>
	)
}

type ViewerOverlayProps = {
	children: ReactNode
	// Lets taps reach the overlay (retry button); otherwise they go to the
	// viewer underneath.
	interactive?: boolean
}

function ViewerOverlay({ children, interactive = false }: ViewerOverlayProps) {
	return (
		<View
			pointerEvents={interactive ? 'auto' : 'none'}
			className='absolute inset-0 items-center justify-center px-8'
		>
			{children}
		</View>
	)
}
