import * as Location from 'expo-location'
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from 'react'

import {
	startDuel,
	submitDuel,
	type Coordinates,
	type DuelStartResult,
} from '@/services/duels'
import type { DuelStart, DuelSubmitResponse } from '@/types/cards'

type DuelContextType = {
	// The scanned QR: "Reintentar" starts the duel again with it.
	code: string | null
	duel: DuelStart | null
	// Chosen option id per question id. Options are reshuffled on every
	// start, so they're only ever matched by id.
	answers: Record<number, number>
	result: DuelSubmitResponse | null
	submitting: boolean
	begin: (code: string, duel: DuelStart) => void
	choose: (questionId: number, answerId: number) => void
	// New attempt with the same code: new questions, answers cleared.
	retry: () => Promise<DuelStartResult>
	// Throws ApiError/NetworkError; the result is stored on success.
	submit: () => Promise<DuelSubmitResponse>
	reset: () => void
}

const DuelContext = createContext<DuelContextType | undefined>(undefined)

type DuelProviderProps = {
	children: ReactNode
}

// Only if location is already allowed: the duel never asks for it.
async function getLastKnownCoordinates(): Promise<Coordinates | null> {
	try {
		const permission = await Location.getForegroundPermissionsAsync()

		if (!permission.granted) return null

		const position = await Location.getLastKnownPositionAsync()

		return position
			? {
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
				}
			: null
	} catch {
		return null
	}
}

// Holds one duel session (scan → quiz → result → review) in memory.
export function DuelProvider({ children }: DuelProviderProps) {
	const [code, setCode] = useState<string | null>(null)
	const [duel, setDuel] = useState<DuelStart | null>(null)
	const [answers, setAnswers] = useState<Record<number, number>>({})
	const [result, setResult] = useState<DuelSubmitResponse | null>(null)
	const [submitting, setSubmitting] = useState(false)
	// A double tap would submit twice and get a 409.
	const inFlight = useRef(false)

	const begin = useCallback((nextCode: string, nextDuel: DuelStart) => {
		setCode(nextCode)
		setDuel(nextDuel)
		setAnswers({})
		setResult(null)
	}, [])

	const choose = useCallback((questionId: number, answerId: number) => {
		setAnswers((current) => ({ ...current, [questionId]: answerId }))
	}, [])

	const retry = useCallback(async () => {
		if (!code) throw new Error('No hay un duelo en curso.')

		const started = await startDuel(code)

		if (started.kind === 'started') {
			begin(code, started.duel)
		}

		return started
	}, [code, begin])

	const submit = useCallback(async () => {
		if (!duel) throw new Error('No hay un duelo en curso.')
		if (inFlight.current) throw new Error('Ya estamos enviando tus respuestas.')

		inFlight.current = true
		setSubmitting(true)

		try {
			const coordinates = await getLastKnownCoordinates()
			const response = await submitDuel(
				duel.attempt_id,
				duel.questions.map((question) => ({
					question_id: question.id,
					answer_id: answers[question.id],
				})),
				coordinates,
			)

			setResult(response)

			return response
		} finally {
			inFlight.current = false
			setSubmitting(false)
		}
	}, [duel, answers])

	const reset = useCallback(() => {
		setCode(null)
		setDuel(null)
		setAnswers({})
		setResult(null)
	}, [])

	const value = useMemo(
		() => ({
			code,
			duel,
			answers,
			result,
			submitting,
			begin,
			choose,
			retry,
			submit,
			reset,
		}),
		[
			code,
			duel,
			answers,
			result,
			submitting,
			begin,
			choose,
			retry,
			submit,
			reset,
		],
	)

	return <DuelContext.Provider value={value}>{children}</DuelContext.Provider>
}

export function useDuel(): DuelContextType {
	const context = useContext(DuelContext)

	if (!context) {
		throw new Error('useDuel debe utilizarse dentro de DuelProvider.')
	}

	return context
}
