import {
	CenterFocusIcon,
	CubeIcon,
	Rotate360Icon,
	Touch01Icon,
} from '@hugeicons/core-free-icons'
import { ViroARSceneNavigator } from '@reactvision/react-viro'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { ScreenStatusBar } from '@/components/ui/ScreenStatusBar'
import { useCallback, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, BackHandler, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ArCameraControls } from '@/components/ar/ArCameraControls'
import {
	ModelPlacementScene,
	type ModelPlacementSceneProps,
} from '@/components/ar/ModelPlacementScene'
import { RoundCameraButton } from '@/components/ar/RoundCameraButton'
import { SurfaceDetectedPill } from '@/components/ar/SurfaceDetectedPill'
import { SurfaceOffer } from '@/components/ar/SurfaceOffer'
import { Viewer360, type Viewer360Handle } from '@/components/ar/Viewer360'
import { CardStats } from '@/components/deck/CardStats'
import BackButton from '@/components/ui/BackButton'
import { CameraNotice } from '@/components/ui/CameraNotice'
import {
	type ArAvailability,
	useArAvailability,
} from '@/hooks/useArAvailability'
import { useCardAsset } from '@/hooks/useCardAsset'
import { useCards } from '@/hooks/useCards'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import { useSurfaceOffer } from '@/hooks/useSurfaceOffer'
import { useViroExit, useViroHandoff } from '@/hooks/useViroHandoff'
import colors from '@/theme/colors'
import type { OwnedCard } from '@/types/cards'

type Phase = 'placing' | 'loading' | 'placed' | 'error'
type View360Status = 'loading' | 'loaded' | 'error'

const noop = () => {}

// Why the 360° view opened on its own, before its instructions.
const REASONS: Partial<Record<ArAvailability, string>> = {
	unsupported: 'Tu teléfono no es compatible con AR. ',
	'no-camera': 'Sin permiso de cámara. ',
}

// AR view of an owned card's animal (A-28 → A-29): find a surface, tap to
// place it at life size, and reset to place it again. The shutter and the
// selfie button are placeholders for now. Without AR (unsupported phone,
// camera denied, or no surface found) the animal shows in the Vista 360°.
export default function CardArScreen() {
	// `mode` is the card view's mode, restored when going back.
	const { id, mode } = useLocalSearchParams<{ id: string; mode?: string }>()
	const insets = useSafeAreaInsets()
	const { data } = useCards()
	const availability = useArAvailability()

	const card = data?.find(
		(item): item is OwnedCard => item.encountered && String(item.id) === id,
	)
	const model = useCardAsset(
		card?.id,
		'model',
		card?.pack?.model,
		card?.model_url ?? null,
	)
	// Fixed once known, so a later copy change can't reset the placement.
	const [modelUrl, setModelUrl] = useState<string | null>(null)

	if (modelUrl === null && model.uri && !model.loading) {
		setModelUrl(model.uri)
	}

	const [phase, setPhase] = useState<Phase>('placing')
	const [planeFound, setPlaneFound] = useState(false)
	const [resetKey, setResetKey] = useState(0)
	// The user chose the 360° view from AR ("¿No encuentras una superficie?").
	const [chose360, setChose360] = useState(false)
	const [view360, setView360] = useState<View360Status>('loading')
	const viewer360Ref = useRef<Viewer360Handle>(null)
	// Back pressed while AR closes for the 360° view: leave instead. The ref
	// is read by the pending switch, the state by the overlay.
	const leavingRef = useRef(false)
	const [leaving, setLeaving] = useState(false)
	const backHref =
		`/deck/${id}?mode=${mode === 'model' ? 'model' : 'card'}` as const

	const view =
		availability === 'checking'
			? null
			: availability === 'ar' && !chose360
				? 'ar'
				: '360'

	const viroReady = useViroHandoff()
	// Leaving mid-load would break the next Viro view: wait for the model.
	const arExit = useViroExit('ar', phase === 'loading')
	const view360Exit = useViroExit(
		'scene3d',
		view === '360' && view360 === 'loading',
	)
	const exiting = view === '360' ? view360Exit.exiting : arExit.exiting
	const showAr = view === 'ar' && Boolean(modelUrl) && viroReady && !exiting
	const show360 = view === '360' && Boolean(modelUrl) && viroReady && !exiting

	useSessionRedirect()

	const offer360 = useSurfaceOffer(showAr && phase === 'placing' && !planeFound)

	// Back to the card view with replace (it was replaced to open AR), once
	// the Viro view has been closed: its 3D view can't start before that.
	const goBack = useCallback(() => {
		const back = () => router.replace(backHref)

		if (view === '360') {
			view360Exit.exit(back)
		} else {
			leavingRef.current = true
			setLeaving(true)
			arExit.exit(back)
		}
	}, [arExit, view360Exit, view, backHref])

	const switchTo360 = () =>
		arExit.exit(() => {
			if (leavingRef.current) router.replace(backHref)
			else setChose360(true)
		})

	useFocusEffect(
		useCallback(() => {
			const subscription = BackHandler.addEventListener(
				'hardwareBackPress',
				() => {
					goBack()
					return true
				},
			)

			return () => subscription.remove()
		}, [goBack]),
	)

	// Stable callbacks: the scene keeps its plane selection across re-renders.
	const sceneProps = useMemo<ModelPlacementSceneProps>(
		() => ({
			modelUrl,
			resetKey,
			onPlaneFound: () => setPlaneFound(true),
			onPlaced: () => setPhase('loading'),
			onModelLoaded: () => setPhase('placed'),
			onModelError: () => setPhase('error'),
		}),
		[modelUrl, resetKey],
	)

	const on360Loaded = useCallback(() => setView360('loaded'), [])
	const on360Error = useCallback(() => setView360('error'), [])

	const placeAgain = () => {
		setPhase('placing')
		setResetKey((value) => value + 1)
	}

	const name = card?.name ?? 'el animal'
	// Closing AR for the 360° view, not leaving.
	const switching = arExit.exiting && !leaving && view === 'ar'

	return (
		<View className='flex-1 bg-tinta'>
			<ScreenStatusBar style='light' />

			{showAr && (
				<ViroARSceneNavigator
					autofocus
					initialScene={{ scene: ModelPlacementScene }}
					viroAppProps={sceneProps}
					style={{ flex: 1 }}
				/>
			)}

			{show360 && (
				<Viewer360
					ref={viewer360Ref}
					modelUrl={modelUrl}
					onModelLoaded={on360Loaded}
					onModelError={on360Error}
				/>
			)}

			{/* Over the camera: lets taps through to the AR view. */}
			<View
				pointerEvents='box-none'
				className='absolute inset-0 justify-between px-5'
				style={{
					paddingTop: insets.top + 8,
					paddingBottom: insets.bottom + 32,
				}}
			>
				<View pointerEvents='box-none'>
					<View
						pointerEvents='box-none'
						className='flex-row items-center justify-between gap-3'
					>
						<BackButton
							onPress={goBack}
							variant='outline'
							position='relative'
						/>
						{card && <CardStats stats={card.stats} variant='pill' />}
					</View>

					{switching ? (
						<CameraNotice message='Abriendo la Vista 360°…' className='mt-4'>
							<ActivityIndicator color={colors.lima} />
						</CameraNotice>
					) : exiting ? (
						<CameraNotice
							message={
								view === '360' ? 'Cerrando la vista…' : 'Cerrando la cámara…'
							}
							className='mt-4'
						>
							<ActivityIndicator color={colors.lima} />
						</CameraNotice>
					) : model.loading || view === null ? (
						<CameraNotice
							message={
								model.downloading
									? 'Descargando el animal…'
									: `Cargando a ${name}…`
							}
							className='mt-4'
						>
							<ActivityIndicator color={colors.lima} />
						</CameraNotice>
					) : !modelUrl ? (
						<CameraNotice
							icon={CubeIcon}
							message='Esta tarjeta aún no tiene modelo 3D.'
							className='mt-4'
						/>
					) : view === '360' ? (
						view360 === 'loading' ? (
							<CameraNotice message={`Cargando a ${name}…`} className='mt-4'>
								<ActivityIndicator color={colors.lima} />
							</CameraNotice>
						) : view360 === 'error' ? (
							<CameraNotice
								message={`No pudimos cargar a ${name}. Vuelve e inténtalo de nuevo.`}
								className='mt-4'
							/>
						) : (
							<CameraNotice
								icon={Rotate360Icon}
								message={`${REASONS[availability] ?? ''}Vista 360°: mueve el teléfono para mirar alrededor y arrastra para girar a ${name}.`}
								className='mt-4'
							/>
						)
					) : phase === 'placing' ? (
						offer360 ? (
							<SurfaceOffer onAccept={switchTo360} className='mt-4' />
						) : (
							<CameraNotice
								icon={Touch01Icon}
								message={`Toca la parte del plano donde quieras colocar a ${name}.`}
								className='mt-4'
							/>
						)
					) : phase === 'loading' ? (
						<CameraNotice message={`Cargando a ${name}…`} className='mt-4'>
							<ActivityIndicator color={colors.lima} />
						</CameraNotice>
					) : phase === 'error' ? (
						<CameraNotice
							message={`No pudimos cargar a ${name}. Toca reiniciar para intentarlo de nuevo.`}
							className='mt-4'
						/>
					) : (
						<CameraNotice
							message={`Toca reiniciar para colocar a ${name} en otro lugar.`}
							className='mt-4'
						/>
					)}
				</View>

				{show360 && view360 === 'loaded' ? (
					<View className='items-center'>
						<RoundCameraButton
							icon={CenterFocusIcon}
							label='Centrar vista'
							onPress={() => viewer360Ref.current?.recenter()}
							tone='white'
						/>
					</View>
				) : (
					showAr &&
					(phase === 'placing' ? (
						planeFound && <SurfaceDetectedPill />
					) : (
						// Shutter and selfie aren't built yet.
						<ArCameraControls
							onReset={placeAgain}
							onShutter={noop}
							onSelfie={noop}
						/>
					))
				)}
			</View>
		</View>
	)
}
