// Offline pack (ZooDeck): encrypted copies of each card's files. The catalog
// never carries keys; a file's key arrives in `pack` exactly where the API
// already reveals its URL.
export type PackKind = 'model' | 'card_image' | 'thumbnail'

// `id` is the file's version: a new id means the file changed.
export type PackRef = {
	id: string
	key: string
}

// `null` when the card has no file of that kind.
export type CardPack = Partial<Record<PackKind, PackRef | null>>

export type PackFile = {
	id: string
	card_id: number
	kind: PackKind
	url: string
	bytes: number
	sha256: string
}

export type PackManifest = {
	generated_at: string
	total_bytes: number
	files: PackFile[]
}

export type PackManifestResponse = {
	success: boolean
	data: PackManifest
}
