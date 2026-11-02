import { CubeIcon, Touch01Icon } from '@hugeicons/core-free-icons'
import { ViroARSceneNavigator } from '@reactvision/react-viro'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, BackHandler, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ArCameraControls } from '@/components/ar/ArCameraControls'
import {
	ModelPlacementScene,
	type ModelPlacementSceneProps,
} from '@/components/ar/ModelPlacementScene'
import { SurfaceDetectedPill } from '@/components/ar/SurfaceDetectedPill'
import { CardStats } from '@/components/deck/CardStats'
import BackButton from '@/components/ui/BackButton'
import { CameraNotice } from '@/components/ui/CameraNotice'
import { useCards } from '@/hooks/useCards'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import { useViroExit, useViroHandoff } from '@/hooks/useViroHandoff'
import colors from '@/theme/colors'
import type { OwnedCard } from '@/types/cards'

type Phase = 'placing' | 'loading' | 'placed' | 'error'

const noop = () => {}

// AR view of an owned card's animal (A-28 → A-29): find a surface, tap to
// place it at life size, and reset to place it again. The shutter and the
// selfie button are placeholders for now.
export default function CardArScreen() {
	// `mode` is the card view's mode, restored when going back.
	const { id, mode } = useLocalSearchParams<{ id: string; mode?: string }>()
	const insets = useSafeAreaInsets()
	const { data } = useCards()

	const card = data?.find(
		(item): item is OwnedCard => item.encountered && String(item.id) === id,
	)
	const modelUrl = card?.model_url ?? null

	const [phase, setPhase] = useState<Phase>('placing')
	const [planeFound, setPlaneFound] = useState(false)
	const [resetKey, setResetKey] = useState(0)

	const viroReady = useViroHandoff()
	// Leaving mid-load would break the next Viro view: wait for the model.
	const { exiting, exit } = useViroExit('ar', phase === 'loading')

	useSessionRedirect()

	// Back to the card view with replace (it was replaced to open AR), once
	// the camera has been closed: its 3D view can't start before that.
	const goBack = useCallback(() => {
		exit(() =>
			router.replace(`/deck/${id}?mode=${mode === 'model' ? 'model' : 'card'}`),
		)
	}, [exit, id, mode])

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

	const placeAgain = () => {
		setPhase('placing')
		setResetKey((value) => value + 1)
	}

	const name = card?.name ?? 'el animal'

	return (
		<View className='flex-1 bg-tinta'>
			<StatusBar style='light' />

			{modelUrl && viroReady && !exiting && (
				<ViroARSceneNavigator
					autofocus
					initialScene={{ scene: ModelPlacementScene }}
					viroAppProps={sceneProps}
					style={{ flex: 1 }}
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

					{exiting ? (
						<CameraNotice message='Cerrando la cámara…' className='mt-4'>
							<ActivityIndicator color={colors.lima} />
						</CameraNotice>
					) : !modelUrl ? (
						<CameraNotice
							icon={CubeIcon}
							message='Esta tarjeta aún no tiene modelo 3D.'
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

				{modelUrl &&
					!exiting &&
					(phase === 'placing' ? (
						planeFound && <SurfaceDetectedPill />
					) : (
						// Shutter and selfie aren't built yet.
						<ArCameraControls
							onReset={placeAgain}
							onShutter={noop}
							onSelfie={noop}
						/>
					))}
			</View>
		</View>
	)
}
