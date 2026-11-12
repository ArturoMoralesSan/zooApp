import {
	Directory,
	type DownloadPauseState,
	File,
	Paths,
} from 'expo-file-system'
import * as SecureStore from 'expo-secure-store'

import type { DeckCard } from '@/types/cards'
import type { PackKind, PackManifest } from '@/types/pack'

// On-device layout of the offline pack. Everything lives in the documents
// directory: the system may clear the cache right before the visit.
//
//   packs/index.json             catalog + ETag + downloaded .bin entries
//   packs/{id}.bin               encrypted files, shared by every user
//   cards/{userId}/index.json    (card_id, kind) → decrypted copy
//   cards/{userId}/cards.json    last /api/cards response and its ETag
//   cards/{userId}/{card_id}-{kind}-{id}.glb|.webp

export type PackEntry = {
	card_id: number
	kind: PackKind
	bytes: number
}

export type PackIndex = {
	etag: string | null
	manifest: PackManifest | null
	checkedAt: number | null
	// Downloaded .bin files by file id.
	files: Record<string, PackEntry>
	// (card_id, kind) pairs whose old .bin was dropped for a newer version
	// that isn't downloaded yet: shown as an update, not a first download.
	replaced: string[]
	// Background downloads on Wi-Fi start once the user asks for the pack
	// ("Descargar") and stop after "Liberar espacio".
	enabled: boolean
	// A download paused mid-file (app in the background, connection lost).
	resume: { id: string; state: DownloadPauseState } | null
}

export type LocalCopy = {
	id: string
	name: string
	bytes: number
}

// `${card_id}-${kind}` → decrypted copy.
export type UserIndex = Record<string, LocalCopy>

export type StoredCards = {
	etag: string | null
	cards: DeckCard[]
}

const LAST_USER_KEY = 'zooapp_pack_user'

export const packsDir = new Directory(Paths.document, 'packs')
const cardsRoot = new Directory(Paths.document, 'cards')

export const assetKey = (cardId: number, kind: PackKind) => `${cardId}-${kind}`

export const binFile = (id: string) => new File(packsDir, `${id}.bin`)
export const partFile = (id: string) => new File(packsDir, `${id}.bin.part`)
const packIndexFile = () => new File(packsDir, 'index.json')

export const userDir = (userId: number) =>
	new Directory(cardsRoot, String(userId))
const userIndexFile = (userId: number) =>
	new File(userDir(userId), 'index.json')
const cardsFile = (userId: number) => new File(userDir(userId), 'cards.json')

export function copyFile(userId: number, name: string) {
	return new File(userDir(userId), name)
}

export function copyName(cardId: number, kind: PackKind, id: string) {
	return `${cardId}-${kind}-${id}.${kind === 'model' ? 'glb' : 'webp'}`
}

function ensureDir(dir: Directory) {
	if (!dir.exists) dir.create({ intermediates: true, idempotent: true })
}

async function readJson<T>(file: File): Promise<T | null> {
	try {
		return file.exists ? (JSON.parse(await file.text()) as T) : null
	} catch {
		// A corrupt index is rebuilt by the next sync.
		return null
	}
}

// Written to a temp file and moved into place, so a crash never leaves a
// half-written index.
function writeJson(file: File, data: unknown) {
	ensureDir(file.parentDirectory)

	const temp = new File(file.parentDirectory, `${file.name}.tmp`)

	temp.write(JSON.stringify(data))
	temp.moveSync(file, { overwrite: true })
}

export function deleteFile(file: File) {
	try {
		if (file.exists) file.delete()
	} catch {
		// Already gone or locked: the next sync retries.
	}
}

export const emptyPackIndex = (): PackIndex => ({
	etag: null,
	manifest: null,
	checkedAt: null,
	files: {},
	replaced: [],
	enabled: false,
	resume: null,
})

export async function readPackIndex(): Promise<PackIndex> {
	return {
		...emptyPackIndex(),
		...(await readJson<PackIndex>(packIndexFile())),
	}
}

export function writePackIndex(index: PackIndex) {
	ensureDir(packsDir)
	writeJson(packIndexFile(), index)
}

export async function readUserIndex(userId: number): Promise<UserIndex> {
	return (await readJson<UserIndex>(userIndexFile(userId))) ?? {}
}

export function writeUserIndex(userId: number, index: UserIndex) {
	writeJson(userIndexFile(userId), index)
}

export async function readStoredCards(
	userId: number,
): Promise<StoredCards | null> {
	return readJson<StoredCards>(cardsFile(userId))
}

export function writeStoredCards(userId: number, data: StoredCards) {
	try {
		writeJson(cardsFile(userId), data)
	} catch {
		// Not critical: the collection just won't be there offline.
	}
}

// Removes the encrypted files ("Liberar espacio"); screens fall back to URLs.
export function wipePacks() {
	try {
		if (packsDir.exists) packsDir.delete()
	} catch {
		// Partially deleted: the next sync reconciles the index.
	}
}

// The user's decrypted copies and cached card list, on logout.
export function wipeUser(userId: number) {
	try {
		const dir = userDir(userId)

		if (dir.exists) dir.delete()
	} catch {
		// Leftovers are overwritten on the next login of the same user.
	}
}

// Last signed-in user, so an offline restart (no /user response) still
// finds that user's cards and copies.
let lastUser: number | null | undefined

export async function getLastUserId(): Promise<number | null> {
	if (lastUser !== undefined) return lastUser

	try {
		const value = await SecureStore.getItemAsync(LAST_USER_KEY)

		lastUser = value ? Number(value) : null
	} catch {
		lastUser = null
	}

	return lastUser
}

export async function setLastUserId(userId: number | null) {
	lastUser = userId

	try {
		if (userId === null) await SecureStore.deleteItemAsync(LAST_USER_KEY)
		else await SecureStore.setItemAsync(LAST_USER_KEY, String(userId))
	} catch {
		// Kept in memory for this run.
	}
}
