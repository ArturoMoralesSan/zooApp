export type Rarity = 'comun' | 'rara' | 'epica' | 'edicion_especial'

export type CardStats = {
	astucia: number
	rapidez: number
	fuerza: number
}

// Same shape on unowned cards, duel start, submit results and the 423 error.
export type Attempts = {
	max: number
	left: number
	locked_until: string | null
}

export type OwnedCard = {
	id: number
	encountered: true
	name: string
	rarity: Rarity
	category_name: string | null
	thumbnail_image: string | null
	card_image_url: string | null
	stats: CardStats
	model_url: string | null
}

// Unowned cards reveal nothing about the animal.
export type UnownedCard = {
	id: number
	encountered: false
	attempts: Attempts
}

export type DeckCard = OwnedCard | UnownedCard

export type CardsResponse = {
	success: boolean
	data: DeckCard[]
}

// The duel's card has no id or card image: those arrive only on a win.
export type DuelCard = {
	name: string
	rarity: Rarity
	category_name: string | null
	thumbnail_image: string | null
	stats: CardStats
	model_url: string | null
}

export type DuelOption = {
	id: number
	answer: string
}

export type DuelQuestion = {
	id: number
	question: string
	answers: DuelOption[]
}

export type DuelStart = {
	attempt_id: number
	attempts: Attempts
	card: DuelCard
	questions: DuelQuestion[]
}

export type DuelStartResponse = {
	success: boolean
	data: DuelStart
}

export type DuelAnswer = {
	question_id: number
	answer_id: number
}

export type DuelOutcome = 'won' | 'retry' | 'locked'

export type DuelQuestionResult = {
	question_id: number
	is_correct: boolean
}

export type DuelReviewItem = {
	question_id: number
	correct_answer_id: number
}

export type DuelResult = {
	outcome: DuelOutcome
	results: DuelQuestionResult[]
	attempts: Attempts | null
	review: DuelReviewItem[] | null
	card: OwnedCard | null
}

export type DuelSubmitResponse = {
	success: boolean
	message: string
	data: DuelResult
}
