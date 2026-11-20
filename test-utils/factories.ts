import type {
	DuelResult,
	DuelStart,
	DuelSubmitResponse,
	OwnedCard,
	UnownedCard,
} from '@/types/cards'
import type { PackFile, PackManifest } from '@/types/pack'

export function makeOwnedCard(overrides: Partial<OwnedCard> = {}): OwnedCard {
	return {
		id: 1,
		encountered: true,
		name: 'Lobo gris',
		rarity: 'rara',
		category_name: 'Mamíferos',
		thumbnail_image: null,
		card_image_url: null,
		stats: { astucia: 50, rapidez: 50, fuerza: 50 },
		model_url: null,
		...overrides,
	}
}

export function makeUnownedCard(
	overrides: Partial<UnownedCard> = {},
): UnownedCard {
	return {
		id: 2,
		encountered: false,
		attempts: { max: 3, left: 3, locked_until: null },
		...overrides,
	}
}

export function makePackFile(overrides: Partial<PackFile> = {}): PackFile {
	const id = overrides.id ?? 'f1'

	return {
		id,
		card_id: 1,
		kind: 'model',
		url: `http://cdn.test/${id}.bin`,
		bytes: 0,
		sha256: '',
		...overrides,
	}
}

export function makeManifest(files: PackFile[]): PackManifest {
	return {
		generated_at: '2026-11-19T00:00:00Z',
		total_bytes: files.reduce((total, file) => total + file.bytes, 0),
		files,
	}
}

export function makeDuelStart(overrides: Partial<DuelStart> = {}): DuelStart {
	return {
		attempt_id: 9,
		attempts: { max: 3, left: 3, locked_until: null },
		card: {
			name: 'Lobo gris',
			rarity: 'rara',
			category_name: 'Mamíferos',
			thumbnail_image: null,
			stats: { astucia: 50, rapidez: 50, fuerza: 50 },
			model_url: null,
		},
		questions: [
			{
				id: 1,
				question: '¿Qué come el lobo?',
				answers: [
					{ id: 11, answer: 'Carne' },
					{ id: 12, answer: 'Pasto' },
				],
			},
		],
		...overrides,
	}
}

export function makeSubmitResponse(
	data: Partial<DuelResult> = {},
): DuelSubmitResponse {
	return {
		success: true,
		message: '',
		data: {
			outcome: 'won',
			results: [],
			attempts: null,
			review: null,
			card: null,
			...data,
		},
	}
}
