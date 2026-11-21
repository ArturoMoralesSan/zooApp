import { Camera01Icon } from '@hugeicons/core-free-icons'
import { ViroARSceneNavigator } from '@reactvision/react-viro'
import { useCameraPermissions } from 'expo-camera'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, BackHandler, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { RoundCameraButton } from '@/components/ar/RoundCameraButton'
import { SelfieScene, type SelfieSceneProps } from '@/components/ar/SelfieScene'
import BackButton from '@/components/ui/BackButton'
import { CameraNotice } from '@/components/ui/CameraNotice'
import { ScreenStatusBar } from '@/components/ui/ScreenStatusBar'
import { useCardAsset } from '@/hooks/useCardAsset'
import { useCards } from '@/hooks/useCards'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import { useViroExit, useViroHandoff } from '@/hooks/useViroHandoff'
import colors from '@/theme/colors'
import type { OwnedCard } from '@/types/cards'

type ModelStatus = 'loading' | 'ready' | 'error'

// Selfie with the card's animal (A-30): AR on the front camera with its 3D
// model. Opened from the card view or from AR (`from`), and goes back there.
export default function SelfieScreen() {
	const { id, mode, from } = useLocalSearchParams<{
		id: string
		mode?: string
		from?: string
	}>()
	const insets = useSafeAreaInsets()
	const { data } = useCards()
	const [permission, requestPermission] = useCameraPermissions()

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
	const [capture, setCapture] = useState<string | null>(null)
	const navigatorRef = useRef<ViroARSceneNavigator>(null)

	const viroReady = useViroHandoff()
	const { exiting, exit } = useViroExit('ar', status === 'loading')
	const granted = permission?.granted === true
	const showScene = granted && Boolean(modelUrl) && viroReady && !exiting

	useSessionRedirect()

	useEffect(() => {
		if (permission && !permission.granted && permission.canAskAgain) {
			void requestPermission()
		}
	}, [permission, requestPermission])

	const modeParam = mode === 'card' ? 'card' : 'model'
	const backHref =
		from === 'ar'
			? (`/deck/ar/${id}?mode=${modeParam}` as const)
			: (`/deck/${id}?mode=${modeParam}` as const)

	// Back with replace (this screen replaced the one before), once the 3D
	// view has been released (see useViroHandoff).
	const goBack = useCallback(
		() => exit(() => router.replace(backHref)),
		[exit, backHref],
	)

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
			playing: false,
			position: [0.3, -0.25],
			modelSize: 0.7,
			yaw: -20,
			onModelReady: () => setStatus('ready'),
			onModelError: () => setStatus('error'),
		}),
		[modelUrl],
	)

	// TEMP: proves the front-camera AR view can be captured with the animal.
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

			<View
				pointerEvents='box-none'
				className='absolute inset-0 justify-between px-5'
				style={{
					paddingTop: insets.top + 8,
					paddingBottom: insets.bottom + 32,
				}}
			>
				<View pointerEvents='box-none'>
					<BackButton onPress={goBack} variant='outline' position='relative' />

					{permission && !granted ? (
						<CameraNotice message='Sin permiso de cámara.' className='mt-4' />
					) : model.loading || status === 'loading' ? (
						<CameraNotice message={`Cargando a ${name}…`} className='mt-4'>
							<ActivityIndicator color={colors.lima} />
						</CameraNotice>
					) : !modelUrl ? (
						<CameraNotice
							message='Esta tarjeta aún no tiene modelo 3D.'
							className='mt-4'
						/>
					) : status === 'error' ? (
						<CameraNotice
							message={`No pudimos cargar a ${name}.`}
							className='mt-4'
						/>
					) : null}

					{capture && (
						<Text className='text-meta mt-2 bg-blanco' selectable>
							{capture}
						</Text>
					)}
				</View>

				<View className='items-center'>
					<RoundCameraButton
						icon={Camera01Icon}
						label='Capturar'
						onPress={() => void takePhoto()}
						tone='white'
					/>
				</View>
			</View>
		</View>
	)
}
