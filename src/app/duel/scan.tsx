import {
	ArrowRight01Icon,
	Cards01Icon,
	QrCodeScanIcon,
	SwordsIcon,
} from '@hugeicons/core-free-icons'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useRef, useState } from 'react'
import { ActivityIndicator, Linking, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { CardStats } from '@/components/deck/CardStats'
import { CameraNotice } from '@/components/duel/CameraNotice'
import { DuelDialog } from '@/components/duel/DuelDialog'
import { ScanFrame } from '@/components/duel/ScanFrame'
import { Badge } from '@/components/ui/Badge'
import BackButton from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { useDuel } from '@/contexts/DuelContext'
import { useDataRefresh } from '@/hooks/useDataRefresh'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import { isNetworkError } from '@/services/api'
import { startDuel, type DuelStartResult } from '@/services/duels'
import { notifyOffline } from '@/services/offline-notice'
import colors from '@/theme/colors'
import { formatUnlockTime } from '@/utils/cards'

type ScanState =
	| { kind: 'scanning' }
	| { kind: 'loading' }
	| (DuelStartResult & { code: string })

// After a refusal or "Rechazar" the QR is usually still in view: ignore the
// same code for a moment so the dialog doesn't open again right away.
const SAME_CODE_COOLDOWN_MS = 3000

export default function ScanScreen() {
	const insets = useSafeAreaInsets()
	const [permission, requestPermission] = useCameraPermissions()
	const { isOffline } = useNetworkStatus()
	const { begin } = useDuel()
	const { addOwnedCard } = useDataRefresh()

	const [state, setState] = useState<ScanState>({ kind: 'scanning' })
	const lastScan = useRef<{ code: string; at: number } | null>(null)

	useSessionRedirect()

	const resume = () => {
		if (lastScan.current) lastScan.current.at = Date.now()
		setState({ kind: 'scanning' })
	}

	const handleScan = async (code: string) => {
		const last = lastScan.current

		if (last?.code === code && Date.now() - last.at < SAME_CODE_COOLDOWN_MS) {
			return
		}

		lastScan.current = { code, at: Date.now() }

		if (isOffline) {
			notifyOffline()
			return
		}

		setState({ kind: 'loading' })

		try {
			const result = await startDuel(code)

			setState({ ...result, code })
		} catch (error) {
			if (isNetworkError(error)) {
				notifyOffline()
				resume()
				return
			}

			setState({
				kind: 'unavailable',
				code,
				message:
					error instanceof Error
						? error.message
						: 'No pudimos iniciar el duelo.',
			})
		}
	}

	const accept = () => {
		if (state.kind !== 'started') return

		begin(state.code, state.duel)
		router.replace('/duel/play')
	}

	const openCard = () => {
		if (state.kind !== 'owned') return

		void addOwnedCard(state.card)
		router.replace(`/deck/${state.card.id}`)
	}

	const scanning = state.kind === 'scanning'

	return (
		<View className='flex-1 bg-tinta'>
			<StatusBar style='light' />

			{permission?.granted && (
				<View className='absolute inset-0'>
					<CameraView
						// Inline: CameraView isn't wired to NativeWind.
						style={{ flex: 1 }}
						facing='back'
						barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
						// Stops scanning while a dialog or request is open.
						onBarcodeScanned={
							scanning ? ({ data }) => void handleScan(data) : undefined
						}
					/>
				</View>
			)}

			<View
				className='absolute inset-0 justify-between px-5'
				style={{
					paddingTop: insets.top + 8,
					paddingBottom: insets.bottom + 32,
				}}
			>
				<View>
					<BackButton
						onPress={() => router.back()}
						variant='outline'
						position='relative'
					/>

					<CameraNotice
						icon={QrCodeScanIcon}
						message='Apunta a la placa del recinto. El QR se escanea solo.'
						className='mt-4'
					/>
				</View>

				<View className='items-center'>
					{permission && !permission.granted ? (
						<CameraNotice
							message='Necesitamos tu cámara para escanear el código QR del recinto.'
							className='w-full'
						>
							<Button
								title={
									permission.canAskAgain ? 'Permitir cámara' : 'Abrir ajustes'
								}
								onPress={() => {
									if (permission.canAskAgain) {
										void requestPermission()
									} else {
										void Linking.openSettings()
									}
								}}
							/>
						</CameraNotice>
					) : (
						<View className='items-center justify-center'>
							<ScanFrame />

							{state.kind === 'loading' && (
								<View className='absolute'>
									<ActivityIndicator size='large' color={colors.lima} />
								</View>
							)}
						</View>
					)}
				</View>

				<Text className='text-center font-sans-semibold text-[14px] text-blanco'>
					¿No lo detecta? Acércate a 30 cm
				</Text>
			</View>

			{/* A-19 RETO */}
			<DuelDialog
				visible={state.kind === 'started'}
				image={
					state.kind === 'started' ? state.duel.card.thumbnail_image : null
				}
				overline={
					state.kind === 'started'
						? ['Nuevo duelo', state.duel.card.category_name]
								.filter(Boolean)
								.join(' · ')
						: undefined
				}
				title={
					state.kind === 'started'
						? `${state.duel.card.name} te ha retado a un duelo`
						: undefined
				}
				message='Responde sus preguntas para ganar su tarjeta.'
				primary={{ title: 'Aceptar', icon: SwordsIcon, onPress: accept }}
				// Rejecting costs nothing: the duel resumes on the next scan.
				secondary={{ title: 'Rechazar', onPress: resume }}
				onRequestClose={resume}
			>
				{state.kind === 'started' && (
					<CardStats stats={state.duel.card.stats} variant='pill' />
				)}
			</DuelDialog>

			{/* 409: the card is already in the deck */}
			<DuelDialog
				visible={state.kind === 'owned'}
				image={state.kind === 'owned' ? state.card.card_image_url : null}
				imageLook='card'
				align='center'
				title={state.kind === 'owned' ? state.card.name : undefined}
				message={state.kind === 'owned' ? state.message : undefined}
				primary={{ title: 'Ver tarjeta', icon: Cards01Icon, onPress: openCard }}
				secondary={{ title: 'Seguir escaneando', onPress: resume }}
				onRequestClose={resume}
			/>

			{/* 423: attempts exhausted, locked until a given time */}
			<DuelDialog
				visible={state.kind === 'locked'}
				align='center'
				title='Vuelve más tarde'
				message={state.kind === 'locked' ? state.message : undefined}
				primary={{
					title: 'Seguir escaneando',
					icon: ArrowRight01Icon,
					onPress: resume,
				}}
				onRequestClose={resume}
			>
				{state.kind === 'locked' && state.attempts.locked_until && (
					<Badge
						tone='pending'
						dot
						label={`Disponible: ${formatUnlockTime(state.attempts.locked_until)}`}
					/>
				)}
			</DuelDialog>

			{/* 404 / 410 / 422: unknown or expired QR, card without questions */}
			<DuelDialog
				visible={state.kind === 'unavailable'}
				align='center'
				title='No pudimos iniciar el duelo'
				message={state.kind === 'unavailable' ? state.message : undefined}
				primary={{
					title: 'Seguir escaneando',
					icon: ArrowRight01Icon,
					onPress: resume,
				}}
				onRequestClose={resume}
			/>
		</View>
	)
}
