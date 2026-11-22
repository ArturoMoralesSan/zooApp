import {
	CameraSmile01Icon,
	CenterFocusIcon,
	CubeIcon,
	Refresh01Icon,
	Rotate360Icon,
	Touch01Icon,
} from '@hugeicons/core-free-icons'
import { ViroARSceneNavigator } from '@reactvision/react-viro'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { ScreenStatusBar } from '@/components/ui/ScreenStatusBar'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, BackHandler, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ArCameraControls } from '@/components/ar/ArCameraControls'
import {
	ModelPlacementScene,
	type ModelPlacementSceneProps,
} from '@/components/ar/ModelPlacementScene'
import { RoundCameraButton } from '@/components/ar/RoundCameraButton'
import { SurfaceDetectedPill } from '@/components/ar/SurfaceDetectedPill'
import { PhotoReview } from '@/components/ar/PhotoReview'
import { SurfaceOffer } from '@/components/ar/SurfaceOffer'
import { Viewer360, type Viewer360Handle } from '@/components/ar/Viewer360'
import { CardStats } from '@/components/deck/CardStats'
import BackButton from '@/components/ui/BackButton'
import { CameraNotice } from '@/components/ui/CameraNotice'
import Toast from '@/components/ui/Toast'
import {
	type ArAvailability,
	useArAvailability,
} from '@/hooks/useArAvailability'
import { useCardAsset } from '@/hooks/useCardAsset'
import { useCards } from '@/hooks/useCards'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import { useSurfaceOffer } from '@/hooks/useSurfaceOffer'
import { useViroExit, useViroHandoff } from '@/hooks/useViroHandoff'
import { markHintShown, wasHintShown } from '@/services/hints'
import { clearPhotos, deletePhoto, takeArPhoto } from '@/services/photo'
import colors from '@/theme/colors'
import type { OwnedCard } from '@/types/cards'

type Phase = 'placing' | 'loading' | 'placed' | 'error'
type View360Status = 'loading' | 'loaded' | 'error'

// Why the 360° view opened on its own, before its instructions.
const REASONS: Partial<Record<ArAvailability, string>> = {
	unsupported: 'Tu teléfono no es compatible con AR. ',
	'no-camera': 'Sin permiso de cámara. ',
}

// AR view of an owned card's animal (A-28 → A-29): find a surface, tap to
// place it at life size, and reset to place it again, take a photo (A-31 →
// A-32) or switch to the selfie. Without AR (unsupported phone,
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
	// The 360° view's controls are explained once per device; null while the
	// flag is read, so a user who has seen them never gets a flash of it.
	const [show360Hint, setShow360Hint] = useState<boolean | null>(null)
	const viewer360Ref = useRef<Viewer360Handle>(null)
	// Back pressed while AR closes for the 360° view: leave instead. The ref
	// is read by the pending switch, the state by the overlay.
	const leavingRef = useRef(false)
	const [leaving, setLeaving] = useState(false)
	const navigatorRef = useRef<ViroARSceneNavigator>(null)
	// The shot under review (A-31), and whether taking one failed.
	const [shot, setShot] = useState<string | null>(null)
	const [shotFailed, setShotFailed] = useState(false)
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

	// Selfie (A-30) runs its own AR session: this one closes first.
	const openSelfie = () => {
		leavingRef.current = true
		setLeaving(true)
		arExit.exit(() =>
			router.replace(`/deck/selfie/${id}?mode=${mode ?? 'card'}&from=ar`),
		)
	}

	// Shots left by a flow that didn't finish (the app closed midway).
	useEffect(() => clearPhotos(), [])

	// Decided once the 360° view shows: the first time on this device it
	// explains the controls, and it's remembered as seen.
	const view360Ready = view === '360' && view360 === 'loaded'

	useEffect(() => {
		if (!view360Ready || show360Hint !== null) return

		let cancelled = false

		void wasHintShown('deck_360_controls').then((shown) => {
			if (cancelled) return

			setShow360Hint(!shown)
			if (!shown) void markHintShown('deck_360_controls')
		})

		return () => {
			cancelled = true
		}
	}, [view360Ready, show360Hint])

	const takePhoto = async () => {
		if (!navigatorRef.current) return

		try {
			setShot(await takeArPhoto(navigatorRef.current))
		} catch {
			setShotFailed(true)
		}
	}

	const retake = () => {
		if (shot) deletePhoto(shot)
		setShot(null)
	}

	// The framed photo goes to the share screen (A-32), once the AR session
	// has been released.
	const keepPhoto = (framed: string) => {
		if (shot) deletePhoto(shot)
		leavingRef.current = true
		setLeaving(true)
		arExit.exit(() =>
			router.replace({
				pathname: '/deck/photo',
				params: {
					uri: framed,
					id,
					mode: mode === 'model' ? 'model' : 'card',
					camera: 'ar',
				},
			}),
		)
	}

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
					ref={navigatorRef}
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
						) : show360Hint ? (
							<CameraNotice
								icon={Rotate360Icon}
								message={`${REASONS[availability] ?? ''}Vista 360°: mueve el teléfono para mirar alrededor y arrastra para girar a ${name}.`}
								className='mt-4'
							/>
						) : null
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
						<ArCameraControls
							left={{
								icon: Refresh01Icon,
								label: 'Colocar de nuevo',
								onPress: placeAgain,
								tone: 'white',
							}}
							onShutter={() => void takePhoto()}
							right={{
								icon: CameraSmile01Icon,
								label: 'Selfie',
								onPress: openSelfie,
								tone: 'lima',
							}}
						/>
					))
				)}
			</View>

			<PhotoReview
				uri={shot}
				name={name}
				area={card?.category_name ?? null}
				onRetake={retake}
				onUse={keepPhoto}
				onError={() => setShotFailed(true)}
			/>

			<Toast
				visible={shotFailed}
				type='error'
				title='No se pudo tomar la foto'
				message='Inténtalo de nuevo. Si sigue fallando, vuelve a abrir la cámara.'
				onHide={() => setShotFailed(false)}
			/>
		</View>
	)
}
