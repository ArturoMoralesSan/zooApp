import {
	Camera01Icon,
	CameraSmile01Icon,
	CubeIcon,
	GridIcon,
	Touch01Icon,
} from '@hugeicons/core-free-icons'
import { ViroARSceneNavigator } from '@reactvision/react-viro'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useCallback, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, BackHandler, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ArCameraControls } from '@/components/ar/ArCameraControls'
import { CameraGrid } from '@/components/ar/CameraGrid'
import { CameraLabel } from '@/components/ar/CameraLabel'
import { SelfieScene, type SelfieSceneProps } from '@/components/ar/SelfieScene'
import BackButton from '@/components/ui/BackButton'
import { CameraNotice } from '@/components/ui/CameraNotice'
import { ScreenStatusBar } from '@/components/ui/ScreenStatusBar'
import { useArAvailability } from '@/hooks/useArAvailability'
import { useCardAsset } from '@/hooks/useCardAsset'
import { useCards } from '@/hooks/useCards'
import { type ModelTransform, useModelGestures } from '@/hooks/useModelGestures'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import { useViroExit, useViroHandoff } from '@/hooks/useViroHandoff'
import colors from '@/theme/colors'
import type { OwnedCard } from '@/types/cards'

type ModelStatus = 'loading' | 'ready' | 'error'

// The animal starts by the visitor's shoulder, turned slightly to them.
const START: ModelTransform = { x: 0.3, y: -0.25, scale: 1, yaw: -20 }
// Largest side at scale 1, in meters.
const MODEL_SIZE = 0.7
// About how far a dp of drag moves the animal at its distance.
const METERS_PER_DP = 0.0024
const LIMITS = {
	x: [-0.9, 0.9],
	y: [-0.9, 0.6],
	scale: [0.4, 2.5],
} satisfies Record<string, [number, number]>

// Selfie with the card's animal (A-30): AR on the front camera with its 3D
// model, which the visitor drags, pinches and twists into place. Opened
// from the card view or from AR (`from`), and goes back there.
export default function SelfieScreen() {
	const { id, mode, from } = useLocalSearchParams<{
		id: string
		mode?: string
		from?: string
	}>()
	const insets = useSafeAreaInsets()
	const { data } = useCards()
	// The front camera needs ARCore too. The 360° dev flag is about the
	// rear-camera AR view, so it doesn't apply here.
	const availability = useArAvailability()
	const canSelfie = availability === 'ar' || availability === 'forced'

	const card = data?.find(
		(item): item is OwnedCard => item.encountered && String(item.id) === id,
	)
	const model = useCardAsset(
		card?.id,
		'model',
		card?.pack?.model,
		card?.model_url ?? null,
	)
	const modelUrl = model.loading ? null : model.uri

	const [status, setStatus] = useState<ModelStatus>('loading')
	// Still at first: the front camera runs at ~20 fps, where a pose looks
	// better than the animation. A tap plays it.
	const [playing, setPlaying] = useState(false)
	const [grid, setGrid] = useState(false)
	const [capture, setCapture] = useState<string | null>(null)
	const navigatorRef = useRef<ViroARSceneNavigator>(null)

	// The gesture hint shows until the animal is moved or tapped.
	const [tapped, setTapped] = useState(false)
	const togglePlaying = useCallback(() => {
		setTapped(true)
		setPlaying((value) => !value)
	}, [])
	const { transform, panHandlers } = useModelGestures(START, {
		metersPerDp: METERS_PER_DP,
		limits: LIMITS,
		onTap: togglePlaying,
	})

	const viroReady = useViroHandoff()
	const { exiting, exit } = useViroExit(
		'ar',
		Boolean(modelUrl) && status === 'loading',
	)
	const showScene = canSelfie && Boolean(modelUrl) && viroReady && !exiting
	const ready = showScene && status === 'ready'

	useSessionRedirect()

	const modeParam = mode === 'card' ? 'card' : 'model'
	const backHref =
		from === 'ar'
			? (`/deck/ar/${id}?mode=${modeParam}` as const)
			: (`/deck/${id}?mode=${modeParam}` as const)

	// Back with replace (this screen replaced the one before), once the AR
	// session has been released (see useViroHandoff).
	const goBack = useCallback(
		() => exit(() => router.replace(backHref)),
		[exit, backHref],
	)

	const openAr = () =>
		exit(() => router.replace(`/deck/ar/${id}?mode=${modeParam}`))

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

	const sceneProps = useMemo<SelfieSceneProps>(
		() => ({
			modelUrl,
			playing,
			position: [transform.x, transform.y],
			modelSize: MODEL_SIZE * transform.scale,
			yaw: transform.yaw,
			onModelReady: () => setStatus('ready'),
			onModelError: () => setStatus('error'),
		}),
		[modelUrl, playing, transform],
	)

	// TEMP: replaced by the photo review in the next step.
	const takePhoto = async () => {
		try {
			const result = (await navigatorRef.current?._takeScreenshot(
				`selfie-${Date.now()}`,
				false,
			)) as { success?: boolean; url?: string; errorCode?: number } | undefined
			setCapture(
				result?.success ? `${result.url}` : `error ${result?.errorCode}`,
			)
		} catch (error) {
			setCapture(`error: ${String(error)}`)
		}
	}

	const name = card?.name ?? 'el animal'

	const notice =
		availability === 'checking' || (canSelfie && model.loading) ? (
			<CameraNotice
				message={
					model.downloading ? 'Descargando el animal…' : `Cargando a ${name}…`
				}
			>
				<ActivityIndicator color={colors.lima} />
			</CameraNotice>
		) : availability === 'unsupported' ? (
			<CameraNotice message='Tu teléfono no es compatible con la selfie en AR.' />
		) : availability === 'no-camera' ? (
			<CameraNotice message='Sin permiso de cámara. Actívalo en los ajustes del teléfono para tomarte una selfie.' />
		) : !modelUrl ? (
			<CameraNotice
				icon={CubeIcon}
				message='Esta tarjeta aún no tiene modelo 3D.'
			/>
		) : exiting ? (
			<CameraNotice message='Cerrando la cámara…'>
				<ActivityIndicator color={colors.lima} />
			</CameraNotice>
		) : status === 'loading' ? (
			<CameraNotice message={`Cargando a ${name}…`}>
				<ActivityIndicator color={colors.lima} />
			</CameraNotice>
		) : status === 'error' ? (
			<CameraNotice
				message={`No pudimos cargar a ${name}. Vuelve e inténtalo de nuevo.`}
			/>
		) : transform === START && !tapped ? (
			<CameraNotice
				icon={Touch01Icon}
				message={`Arrastra a ${name} para moverlo, pellizca para cambiar su tamaño y gira con dos dedos. Tócalo para animarlo.`}
			/>
		) : null

	return (
		<View className='flex-1 bg-tinta'>
			<ScreenStatusBar style='light' />

			{showScene && (
				<ViroARSceneNavigator
					ref={navigatorRef}
					frontCameraEnabled
					autofocus
					initialScene={{ scene: SelfieScene }}
					viroAppProps={sceneProps}
					style={{ flex: 1 }}
				/>
			)}

			{/* Gestures for the animal: Viro's view doesn't handle them here. */}
			{ready && (
				<View
					className='absolute inset-0'
					accessibilityHint='Arrastra para mover al animal, pellizca para cambiar su tamaño y tócalo para animarlo'
					{...panHandlers}
				/>
			)}

			{ready && grid && <CameraGrid />}

			{/* Empty areas let touches through to the gesture layer. */}
			<View
				pointerEvents='box-none'
				className='absolute inset-0 justify-between px-5'
				style={{
					paddingTop: insets.top + 8,
					paddingBottom: insets.bottom + 32,
				}}
			>
				<View pointerEvents='box-none'>
					<View pointerEvents='box-none' className='justify-center'>
						<BackButton
							onPress={goBack}
							variant='outline'
							position='relative'
						/>
						<View pointerEvents='none' className='absolute inset-x-12'>
							<CameraLabel
								icon={CameraSmile01Icon}
								label={`Selfie con ${name}`}
							/>
						</View>
					</View>

					<View pointerEvents='none' className='mt-4'>
						{notice}
					</View>

					{capture && (
						<Text className='text-meta mt-2 bg-blanco' selectable>
							{capture}
						</Text>
					)}
				</View>

				{ready && (
					<ArCameraControls
						left={{
							icon: GridIcon,
							label: grid ? 'Ocultar cuadrícula' : 'Mostrar cuadrícula',
							onPress: () => setGrid((value) => !value),
							tone: grid ? 'lima' : 'white',
						}}
						onShutter={() => void takePhoto()}
						right={{
							icon: Camera01Icon,
							label: 'Ver en AR',
							onPress: openAr,
							tone: 'white',
						}}
					/>
				)}
			</View>
		</View>
	)
}
