import {
	CameraSmile01Icon,
	CenterFocusIcon,
	CubeIcon,
	Refresh01Icon,
	Rotate360Icon,
	Target02Icon,
	Touch01Icon,
} from '@hugeicons/core-free-icons'
import { ViroARSceneNavigator } from '@reactvision/react-viro'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { ScreenStatusBar } from '@/components/ui/ScreenStatusBar'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, BackHandler, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AnimalViewSwitch } from '@/components/ar/AnimalViewSwitch'
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
import { useAnimalView } from '@/hooks/useAnimalView'
import { useArPlacement } from '@/hooks/useArPlacement'
import { useCardAsset } from '@/hooks/useCardAsset'
import { useCards } from '@/hooks/useCards'
import { useSessionGraphics } from '@/hooks/useSessionGraphics'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import { useSurfaceOffer } from '@/hooks/useSurfaceOffer'
import { useViroExit, useViroHandoff } from '@/hooks/useViroHandoff'
import { markHintShown, wasHintShown } from '@/services/hints'
import { clearPhotos, deletePhoto, takeArPhoto } from '@/services/photo'
import colors from '@/theme/colors'
import type { OwnedCard } from '@/types/cards'
import type { AnimalView, ArPlacement } from '@/types/settings'
import { GRAPHICS_PRESETS } from '@/utils/settings'

// 'plane': placing (tap) → loading → placed. 'auto': the model loads first,
// then floats while searching for the floor → placed.
type Phase = 'placing' | 'loading' | 'searching' | 'placed' | 'error'
type View360Status = 'loading' | 'loaded' | 'error'

// Why the 360° view opened on its own, before its instructions. A denied
// camera gets a toast instead: it can happen again on every switch.
const REASONS: Partial<Record<ArAvailability, string>> = {
	unsupported: 'Tu teléfono no es compatible con AR. ',
}

// AR view of an owned card's animal (A-28 → A-29): find a surface and place
// it at life size, automatically or with a tap (the "Colocación del animal"
// setting), and reset to place it again, take a photo (A-31 →
// A-32) or switch to the selfie. It opens in the saved "Vista de los
// animales", and the switch above the controls changes between AR and the
// Vista 360° (and saves it). Without ARCore, or with the camera denied, the
// animal shows in the 360° view.
export default function CardArScreen() {
	// `mode` is the card view's mode, restored when going back.
	const { id, mode } = useLocalSearchParams<{ id: string; mode?: string }>()
	const insets = useSafeAreaInsets()
	const { data } = useCards()
	// The view for this visit: the saved one, then what the switch picks.
	const savedView = useAnimalView()
	const [target, setTarget] = useState<AnimalView | null>(null)

	if (target === null && savedView.view) setTarget(savedView.view)
	// The camera is asked for only when AR is wanted.
	const availability = useArAvailability({ camera: target === 'ar' })
	// The phone has ARCore, so the switch can offer AR. Latched: asking for
	// the camera reads as 'checking' for a moment.
	const [arExists, setArExists] = useState(false)

	if (!arExists && (availability === 'ar' || availability === 'no-camera')) {
		setArExists(true)
	}
	// Camera denied: this visit goes on in the 360° view, the saved choice
	// stays, and a toast says why.
	const [cameraDenied, setCameraDenied] = useState(false)

	if (target === 'ar' && availability === 'no-camera') {
		setTarget('360')
		setCameraDenied(true)
	}

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

	// Read once per AR session, so the mode never changes mid-session.
	const saved = useArPlacement().placement
	const [placement, setPlacement] = useState<ArPlacement | null>(null)

	if (placement === null && saved) setPlacement(saved)
	// The graphics level, also fixed for the session.
	const graphics = useSessionGraphics()

	const auto = placement === 'auto'
	// null until a scene event: the first phase depends on the mode.
	const [phaseState, setPhase] = useState<Phase | null>(null)
	const phase = phaseState ?? (auto ? 'loading' : 'placing')
	// Looking for a surface: the pill, and the 360° offer after a while.
	const searching = auto
		? phase === 'loading' || phase === 'searching'
		: phase === 'placing'
	const [planeFound, setPlaneFound] = useState(false)
	const [resetKey, setResetKey] = useState(0)
	// The view being opened by the switch or the surface offer.
	const [switchingTo, setSwitchingTo] = useState<AnimalView | null>(null)
	const [view360, setView360] = useState<View360Status>('loading')
	// Viewer360's loading cover: recentering waits until it has faded out.
	const [view360Covered, setView360Covered] = useState(true)
	// The 360° view's controls are explained once per device; null while the
	// flag is read, so a user who has seen them never gets a flash of it.
	const [show360Hint, setShow360Hint] = useState<boolean | null>(null)
	const viewer360Ref = useRef<Viewer360Handle>(null)
	// Back pressed while a view closes for the other one: leave instead. The
	// ref is read by the pending switch, the state by the overlay.
	const leavingRef = useRef(false)
	const [leaving, setLeaving] = useState(false)
	const navigatorRef = useRef<ViroARSceneNavigator>(null)
	// The shot under review (A-31), and whether taking one failed.
	const [shot, setShot] = useState<string | null>(null)
	const [shotFailed, setShotFailed] = useState(false)
	const backHref =
		`/deck/${id}?mode=${mode === 'model' ? 'model' : 'card'}` as const

	const view =
		target === null || availability === 'checking'
			? null
			: target === 'ar' && availability === 'ar'
				? 'ar'
				: '360'

	const viroReady = useViroHandoff()
	// Leaving mid-load would break the next Viro view: wait for the model.
	// Auto placement's hit tests stop before the view goes.
	const arExit = useViroExit('ar', phase === 'loading', auto)
	const view360Exit = useViroExit(
		'scene3d',
		view === '360' && view360 === 'loading',
	)
	const exiting = view === '360' ? view360Exit.exiting : arExit.exiting
	const showAr =
		view === 'ar' &&
		Boolean(modelUrl) &&
		placement !== null &&
		graphics !== null &&
		viroReady &&
		!exiting
	const show360 =
		view === '360' &&
		Boolean(modelUrl) &&
		graphics !== null &&
		viroReady &&
		!exiting

	useSessionRedirect()

	const offer360 = useSurfaceOffer(showAr && searching && !planeFound)

	// Back to the card view with replace (it was replaced to open AR), once
	// the Viro view has been closed: its 3D view can't start before that.
	const goBack = useCallback(() => {
		const back = () => router.replace(backHref)

		leavingRef.current = true
		setLeaving(true)
		if (view === '360') view360Exit.exit(back)
		else arExit.exit(back)
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

	// Closes the open view, then opens the other one. `save`: chosen with the
	// switch, so it's remembered; the surface offer only changes this visit.
	const switchView = (next: AnimalView, save: boolean) => {
		if (view === null || view === next || switchingTo) return

		const current = view === 'ar' ? arExit : view360Exit

		if (save) savedView.setView(next)
		setSwitchingTo(next)
		current.exit(() => {
			if (leavingRef.current) {
				router.replace(backHref)
				return
			}

			current.reset()
			setSwitchingTo(null)
			// Each view starts over.
			if (next === 'ar') {
				setPhase(null)
				setPlaneFound(false)
			} else {
				setView360('loading')
			}
			setTarget(next)
		})
	}

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
			placement: placement ?? 'plane',
			graphics: graphics ?? GRAPHICS_PRESETS.high,
			resetKey,
			closing: arExit.closing,
			onPlaneFound: () => setPlaneFound(true),
			onPlaced: () => setPhase(placement === 'auto' ? 'placed' : 'loading'),
			onModelLoaded: () =>
				setPhase(placement === 'auto' ? 'searching' : 'placed'),
			onModelError: () => setPhase('error'),
		}),
		[modelUrl, placement, graphics, resetKey, arExit.closing],
	)

	const on360Loaded = useCallback(() => setView360('loaded'), [])
	const on360Error = useCallback(() => setView360('error'), [])

	// In auto mode a model that failed loads again; one that loaded floats.
	const placeAgain = () => {
		setPhase(auto ? (phase === 'error' ? 'loading' : 'searching') : 'placing')
		setResetKey((value) => value + 1)
	}

	const name = card?.name ?? 'el animal'
	// Only with ARCore and something to show.
	const showSwitch = arExists && Boolean(modelUrl)
	// Closing a view for the other one, not leaving.
	const switching = switchingTo !== null && !leaving

	return (
		<View className='flex-1 bg-tinta'>
			<ScreenStatusBar style='light' />

			{showAr && (
				<ViroARSceneNavigator
					ref={navigatorRef}
					autofocus
					// The animal's live shadow (ArLights, ArShadow).
					shadowsEnabled={graphics?.arLiveShadow}
					initialScene={{ scene: ModelPlacementScene }}
					viroAppProps={sceneProps}
					style={{ flex: 1 }}
				/>
			)}

			{show360 && graphics && (
				<Viewer360
					ref={viewer360Ref}
					modelUrl={modelUrl}
					graphics={graphics}
					onModelLoaded={on360Loaded}
					onModelError={on360Error}
					onCoverChange={setView360Covered}
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
						<CameraNotice
							message={
								switchingTo === '360'
									? 'Abriendo la Vista 360°…'
									: 'Abriendo la cámara…'
							}
							className='mt-4'
						>
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
					) : model.loading ||
					  view === null ||
					  // Waiting for the saved placement mode and graphics.
					  (view === 'ar' && placement === null) ||
					  graphics === null ? (
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
						// Viewer360's own cover shows the loading.
						view360 === 'loading' ? null : view360 === 'error' ? (
							<CameraNotice
								message={`No pudimos cargar a ${name}. Vuelve e inténtalo de nuevo.`}
								className='mt-4'
							/>
						) : show360Hint ? (
							<CameraNotice
								icon={Rotate360Icon}
								message={`${REASONS[availability] ?? ''}Vista 360°: mueve el teléfono para mirar alrededor y arrastra para girar a ${name}.`}
								className='mt-4'
								onDismiss={() => setShow360Hint(false)}
							/>
						) : null
					) : offer360 ? (
						<SurfaceOffer
							onAccept={() => switchView('360', false)}
							className='mt-4'
						/>
					) : phase === 'searching' ? (
						<CameraNotice
							icon={Target02Icon}
							message={
								planeFound
									? `Apunta al suelo donde quieras a ${name}.`
									: 'Mueve el teléfono despacio para encontrar el suelo.'
							}
							className='mt-4'
						/>
					) : phase === 'placing' ? (
						<CameraNotice
							icon={Touch01Icon}
							message={`Toca la parte del plano donde quieras colocar a ${name}.`}
							className='mt-4'
						/>
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

				{/* Controls, then the view switch on the bottom edge (like a
				    camera's modes), the same spot in both views. */}
				<View pointerEvents='box-none' className='gap-4'>
					{/* Fixed height (the shutter's), so the controls don't jump
					    between views or as the animal is placed. */}
					<View
						pointerEvents='box-none'
						className={showSwitch ? 'h-[76px] justify-center' : ''}
					>
						{show360 && view360 === 'loaded' && !view360Covered ? (
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
							(searching ? (
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

					{showSwitch && view && (
						<AnimalViewSwitch
							value={switchingTo ?? view}
							onChange={(next) => switchView(next, true)}
							disabled={switchingTo !== null || exiting || leaving}
							className='self-center'
						/>
					)}
				</View>
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

			<Toast
				visible={cameraDenied}
				type='warning'
				title='Sin permiso de cámara'
				message={`Para ver a ${name} en AR, permite la cámara. Si no te lo pregunta, actívala en los ajustes de Android.`}
				onHide={() => setCameraDenied(false)}
			/>
		</View>
	)
}
