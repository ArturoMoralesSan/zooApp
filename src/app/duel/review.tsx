import { Cards01Icon } from '@hugeicons/core-free-icons'
import { router } from 'expo-router'
import { ScrollView, Text, View } from 'react-native'

import { DuelAnswer, type DuelAnswerState } from '@/components/duel/DuelAnswer'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import { ScreenHeader } from '@/components/ui/TabHeader'
import { TopBar } from '@/components/ui/TopBar'
import { useDuel } from '@/contexts/DuelContext'
import { useScrolled } from '@/hooks/useScrolled'
import { useScrollBottomSpace } from '@/theme/layout'

// Final review after the lock: the correct option of each question of the
// last attempt, joined with the questions and the user's picks in memory.
export default function DuelReviewScreen() {
	const { scrolled, pastTitle, onScroll, onTitleLayout } = useScrolled()
	const bottomSpace = useScrollBottomSpace(40)
	const { duel, answers, result } = useDuel()
	const review = result?.data.review

	const leave = () => router.back()

	return (
		<ScreenBackground>
			<TopBar
				onBack={leave}
				title='Respuestas'
				showTitle={pastTitle}
				scrolled={scrolled}
			/>

			<ScrollView
				onScroll={onScroll}
				scrollEventThrottle={16}
				className='flex-1'
				contentContainerClassName='grow px-5 pt-2'
				contentContainerStyle={{ paddingBottom: bottomSpace }}
			>
				<ScreenHeader
					title='Respuestas'
					subtitle={
						duel
							? `Las respuestas correctas de tu último intento con ${duel.card.name}.`
							: undefined
					}
					className='mb-6'
					onLayout={onTitleLayout}
				/>

				{!duel || !review ? (
					<EmptyState
						icon={Cards01Icon}
						title='No hay respuestas para mostrar'
						message='Escanea el QR del recinto para volver a jugar.'
					/>
				) : (
					<View className='gap-4'>
						{duel.questions.map((question, i) => {
							const correctId = review.find(
								(item) => item.question_id === question.id,
							)?.correct_answer_id

							const stateOf = (answerId: number): DuelAnswerState => {
								if (answerId === correctId) return 'correct'
								if (answers[question.id] === answerId) return 'incorrect'

								return 'idle'
							}

							return (
								<Card key={question.id}>
									<Text className='text-overline text-esmeralda'>
										Pregunta {i + 1} de {duel.questions.length}
									</Text>
									<Text
										className='text-h3 mb-3 mt-1 text-tinta'
										accessibilityRole='header'
									>
										{question.question}
									</Text>

									<View className='gap-2'>
										{question.answers.map((option) => (
											<DuelAnswer
												key={option.id}
												label={option.answer}
												state={stateOf(option.id)}
											/>
										))}
									</View>
								</Card>
							)
						})}
					</View>
				)}

				<Button title='Volver a ZooDeck' onPress={leave} className='mt-8' />
			</ScrollView>
		</ScreenBackground>
	)
}
