import {
	ArrowRight01Icon,
	Cards01Icon,
	Flag02Icon,
	Refresh01Icon,
	SwordsIcon,
	Touch01Icon,
} from '@hugeicons/core-free-icons'
import { ViroARSceneNavigator } from '@reactvision/react-viro'
import { router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { CardStats } from '@/components/deck/CardStats'
import { CameraNotice } from '@/components/ui/CameraNotice'
import {
	ModelPlacementScene,
	type ModelPlacementSceneProps,
} from '@/components/ar/ModelPlacementScene'
import { DebugQuizBackground } from '@/components/duel/DebugQuizBackground'
import { DuelAnswer, type DuelAnswerState } from '@/components/duel/DuelAnswer'
import { DuelDialog } from '@/components/duel/DuelDialog'
import { Badge } from '@/components/ui/Badge'
import BackButton from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import Toast from '@/components/ui/Toast'
import { useDuel } from '@/contexts/DuelContext'
import { useDataRefresh } from '@/hooks/useDataRefresh'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { isNetworkError } from '@/services/api'
import { notifyOffline } from '@/services/offline-notice'
import colors from '@/theme/colors'
import { formatUnlockTime, rarityLabel } from '@/utils/cards'
import { DEBUG_DUEL_CODE, ZOODECK_QUIZ_DEBUG } from '@/utils/zoodeckDebug'

type Phase = 'placing' | 'ready' | 'quiz'
type ModelStatus = 'waiting' | 'loading' | 'loaded' | 'error'

type ToastState = { title: string; message: string } | null

export default function DuelPlayScreen() {
	const insets = useSafeAreaInsets()
	const { isOffline } = useNetworkStatus()
	const { addOwnedCard } = useDataRefresh()
	const { code, duel, answers, result, submitting, choose, retry, submit } =
		useDuel()

	// Debug duel: a 3D view replaces the AR camera, so nothing is placed.
	const debug = ZOODECK_QUIZ_DEBUG && code === DEBUG_DUEL_CODE
	const modelUrl = duel?.card.model_url ?? null
	// Without a model there's nothing to place: straight to A-20.
	const [phase, setPhase] = useState<Phase>(
		modelUrl && !debug ? 'placing' : 'ready',
	)
	const [modelStatus, setModelStatus] = useState<ModelStatus>('waiting')
	const [index, setIndex] = useState(0)
	const [retrying, setRetrying] = useState(false)
	const [toast, setToast] = useState<ToastState>(null)
	const hideToast = useCallback(() => setToast(null), [])

	// Stable props: the scene keeps its placement across overlay re-renders.
	const sceneProps = useMemo<ModelPlacementSceneProps>(
		() => ({
			modelUrl,
			onPlaced: () => setModelStatus('loading'),
			onModelLoaded: () => {
				setModelStatus('loaded')
				setPhase((current) => (current === 'placing' ? 'ready' : current))
			},
			// The quiz doesn't need the model: let the duel go on without it.
			onModelError: () => {
				setModelStatus('error')
				setPhase((current) => (current === 'placing' ? 'ready' : current))
			},
		}),
		[modelUrl],
	)

	const leave = () => router.back()

	if (!duel) {
		// Reached without a scan (e.g. after a reload): nothing to play.
		return (
			<View
				className='flex-1 justify-center gap-4 bg-tinta px-5'
				style={{ paddingBottom: insets.bottom }}
			>
				<StatusBar style='light' />
				<CameraNotice message='Este duelo ya no está disponible. Escanea el QR del recinto otra vez.' />
				<Button title='Volver' onPress={leave} />
			</View>
		)
	}

	const { card, questions, attempts } = duel
	const question = questions[index]
	const isLast = index === questions.length - 1
	const allAnswered = questions.every((q) => answers[q.id] !== undefined)
	const attemptsLabel = `${attempts.left} ${attempts.left === 1 ? 'intento' : 'intentos'}`

	// After a failed submit, the picked option shows ✓/✗ behind the dialog.
	// The correct option is never revealed here.
	const answerState = (
		questionId: number,
		answerId: number,
	): DuelAnswerState => {
		if (answers[questionId] !== answerId) return 'idle'

		const graded = result?.data.results.find(
			(item) => item.question_id === questionId,
		)

		if (!graded) return 'selected'

		return graded.is_correct ? 'correct' : 'incorrect'
	}

	const handleSubmit = async () => {
		if (isOffline) {
			notifyOffline()
			return
		}

		try {
			await submit()
		} catch (error) {
			if (isNetworkError(error)) {
				notifyOffline()
				return
			}

			setToast({
				title: 'No pudimos enviar tus respuestas',
				message: error instanceof Error ? error.message : 'Inténtalo de nuevo.',
			})
		}
	}

	const handleRetry = async () => {
		if (isOffline) {
			notifyOffline()
			return
		}

		setRetrying(true)

		try {
			const started = await retry()

			if (started.kind === 'started') {
				setIndex(0)
				setPhase('quiz')
				return
			}

			setToast({ title: 'No pudimos reintentar', message: started.message })
		} catch (error) {
			if (isNetworkError(error)) {
				notifyOffline()
				return
			}

			setToast({
				title: 'No pudimos reintentar',
				message: error instanceof Error ? error.message : 'Inténtalo de nuevo.',
			})
		} finally {
			setRetrying(false)
		}
	}

	// A-22 → A-26: the won card goes into the cached list so its view opens
	// right away, then the list revalidates.
	const takeCard = () => {
		const won = result?.data.card

		if (!won) {
			router.replace('/deck')
			return
		}

		void addOwnedCard(won)
		router.replace(`/deck/${won.id}`)
	}

	const outcome = result?.data.outcome
	const resultAttempts = result?.data.attempts

	return (
		<View className='flex-1 bg-tinta'>
			<StatusBar style='light' />

			{debug ? (
				<DebugQuizBackground
					modelUrl={modelUrl}
					onModelReady={sceneProps.onModelLoaded}
					onModelError={sceneProps.onModelError}
				/>
			) : (
				<ViroARSceneNavigator
					autofocus
					initialScene={{ scene: ModelPlacementScene }}
					viroAppProps={sceneProps}
					style={{ flex: 1 }}
				/>
			)}

			{/* Over the camera: lets taps through to the AR view while placing. */}
			<View
				pointerEvents='box-none'
				className='absolute inset-0 px-5'
				style={{
					paddingTop: insets.top + 8,
					paddingBottom: insets.bottom + 24,
				}}
			>
				{/* TOP: back + stats */}
				<View
					pointerEvents='box-none'
					className='flex-row items-center justify-between gap-3'
				>
					<BackButton onPress={leave} variant='outline' position='relative' />

					{phase !== 'placing' && (
						<CardStats stats={card.stats} variant='pill' />
					)}
				</View>

				{phase === 'placing' && (
					<CameraNotice
						icon={Touch01Icon}
						message={
							modelStatus === 'loading'
								? `Cargando a ${card.name}…`
								: `Toca el plano donde quieras colocar a ${card.name}.`
						}
						className='mt-4'
					>
						{modelStatus === 'loading' && (
							<ActivityIndicator color={colors.lima} />
						)}
					</CameraNotice>
				)}

				{/* A-20 BATALLA */}
				{phase === 'ready' && (
					<>
						<View className='mt-4 items-center gap-2 self-center rounded-2xl bg-tinta/[0.82] px-6 py-3'>
							<Text className='text-h1 text-blanco' accessibilityRole='header'>
								{card.name}
							</Text>
							{/* Badge is self-start; its wrapper is what gets centered. */}
							<View>
								<Badge tone='success' label={rarityLabel(card.rarity)} />
							</View>
						</View>

						<View pointerEvents='box-none' style={{ flex: 1 }} />

						{modelStatus === 'error' && (
							<CameraNotice
								message={`No pudimos mostrar a ${card.name}, pero puedes jugar el duelo.`}
								className='mb-3'
							/>
						)}

						<CameraNotice
							icon={SwordsIcon}
							message={`${card.name} está listo. Tienes ${attemptsLabel} para ganar su tarjeta.`}
						/>

						<Button
							title='Empezar duelo'
							icon={ArrowRight01Icon}
							iconPosition='leading'
							onPress={() => setPhase('quiz')}
							className='mt-3'
						/>
					</>
				)}

				{/* A-21 QUIZ */}
				{phase === 'quiz' && question && (
					<>
						<View className='mt-3 rounded-2xl border-1.5 border-card-border bg-blanco p-4'>
							<View className='flex-row items-center justify-between gap-3'>
								<Text className='text-overline min-w-0 flex-1 text-esmeralda'>
									Pregunta {index + 1} de {questions.length} · {card.name}
								</Text>
								<Badge tone='success' label={attemptsLabel} />
							</View>

							<Text
								className='text-h3 mt-2 text-tinta'
								accessibilityRole='header'
							>
								{question.question}
							</Text>
						</View>

						<View pointerEvents='box-none' style={{ flex: 1 }} />

						<View accessibilityRole='radiogroup' className='gap-3'>
							{question.answers.map((option) => (
								<DuelAnswer
									key={option.id}
									label={option.answer}
									state={answerState(question.id, option.id)}
									// Graded answers are read-only until a retry.
									onPress={
										result ? undefined : () => choose(question.id, option.id)
									}
								/>
							))}
						</View>

						<View className='mt-4 flex-row gap-3'>
							{index > 0 && (
								<View style={{ flex: 1 }}>
									<Button
										title='Anterior'
										variant='secondary'
										onPress={() => setIndex(index - 1)}
									/>
								</View>
							)}

							<View style={{ flex: 1 }}>
								{isLast ? (
									<Button
										title='Enviar'
										loading={submitting}
										disabled={!allAnswered || submitting || Boolean(result)}
										onPress={() => void handleSubmit()}
									/>
								) : (
									<Button
										title='Siguiente'
										disabled={answers[question.id] === undefined}
										onPress={() => setIndex(index + 1)}
									/>
								)}
							</View>
						</View>
					</>
				)}
			</View>

			{/* A-22 GANASTE */}
			<DuelDialog
				visible={outcome === 'won'}
				image={result?.data.card?.card_image_url ?? null}
				imageLook='card'
				align='center'
				title={result?.message}
				primary={{
					title: 'Tomar tarjeta',
					icon: Cards01Icon,
					onPress: takeCard,
				}}
				onRequestClose={takeCard}
			/>

			{/* A-23 PERDISTE */}
			<DuelDialog
				visible={outcome === 'retry'}
				image={card.thumbnail_image}
				align='center'
				title={result?.message}
				primary={{
					title: 'Reintentar',
					icon: Refresh01Icon,
					loading: retrying,
					onPress: () => void handleRetry(),
				}}
				// The failure is already counted: leaving needs no request.
				secondary={{
					title: 'Rendirte',
					icon: Flag02Icon,
					disabled: retrying,
					onPress: leave,
				}}
				onRequestClose={leave}
			>
				{resultAttempts && (
					<Badge
						tone='pending'
						dot
						label={`Reintentos: ${resultAttempts.left} de ${resultAttempts.max}`}
					/>
				)}
			</DuelDialog>

			{/* LOCKED: last attempt failed */}
			<DuelDialog
				visible={outcome === 'locked'}
				image={card.thumbnail_image}
				align='center'
				title={result?.message}
				primary={
					result?.data.review
						? {
								title: 'Ver respuestas',
								icon: ArrowRight01Icon,
								onPress: () => router.replace('/duel/review'),
							}
						: { title: 'Salir', onPress: leave }
				}
				secondary={
					result?.data.review ? { title: 'Salir', onPress: leave } : undefined
				}
				onRequestClose={leave}
			>
				{resultAttempts?.locked_until && (
					<Badge
						tone='pending'
						dot
						label={`Disponible: ${formatUnlockTime(resultAttempts.locked_until)}`}
					/>
				)}
			</DuelDialog>

			<Toast
				visible={toast !== null}
				type='error'
				title={toast?.title}
				message={toast?.message ?? ''}
				onHide={hideToast}
			/>
		</View>
	)
}
