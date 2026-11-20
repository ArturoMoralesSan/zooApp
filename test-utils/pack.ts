import { Directory, Paths } from 'expo-file-system'
import * as SecureStore from 'expo-secure-store'
import { http, HttpResponse } from 'msw'

import type { DeckCard } from '@/types/cards'
import type { PackFile } from '@/types/pack'

import {
	makeManifest,
	makeOwnedCard,
	makePackFile,
	makeUnownedCard,
} from './factories'
import { API } from './server'

const toHex = (bytes: Uint8Array) =>
	Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')

const toBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes))

// An encrypted .bin in the server's format: iv (12) | ciphertext | GCM tag
// (16), AES-256 (the key size the server uses).
export async function makeBin(plain: string | Uint8Array) {
	// A copy: WebCrypto only takes views over a plain ArrayBuffer.
	const bytes =
		typeof plain === 'string'
			? new TextEncoder().encode(plain)
			: new Uint8Array(plain)
	const raw = crypto.getRandomValues(new Uint8Array(32))
	const iv = crypto.getRandomValues(new Uint8Array(12))
	const key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, [
		'encrypt',
	])
	const sealed = new Uint8Array(
		await crypto.subtle.encrypt(
			{ name: 'AES-GCM', iv, tagLength: 128 },
			key,
			bytes,
		),
	)
	const bin = new Uint8Array(iv.length + sealed.length)

	bin.set(iv)
	bin.set(sealed, iv.length)

	return {
		bin,
		keyBase64: toBase64(raw),
		sha256: toHex(new Uint8Array(await crypto.subtle.digest('SHA-256', bin))),
	}
}

// A card's 3D model as the pack has it: the catalog entry, its encrypted
// .bin, and the card as /api/cards lists it (owned cards carry the key).
export async function makePackedCard(
	cardId: number,
	{ owned = true, version = 'v1', plain = `model ${cardId}` } = {},
) {
	const { bin, keyBase64, sha256 } = await makeBin(plain)
	const id = `${cardId}-${version}`
	const file = makePackFile({
		id,
		card_id: cardId,
		kind: 'model',
		bytes: bin.length,
		sha256,
	})
	const card: DeckCard = owned
		? makeOwnedCard({
				id: cardId,
				pack: { model: { id, key: keyBase64 } },
			})
		: makeUnownedCard({ id: cardId })

	return { file, bin, card, plain }
}

export type PackedCard = Awaited<ReturnType<typeof makePackedCard>>

// Serves the catalog, the card list and the files of these cards.
export function servePack(cards: PackedCard[]) {
	const files = serveFiles(
		Object.fromEntries(cards.map(({ file, bin }) => [file.url, bin])),
	)

	return {
		handlers: [
			serveManifest(cards.map(({ file }) => file)),
			serveCards(cards.map(({ card }) => card)),
			files.handler,
		],
		downloaded: files.downloaded,
	}
}

// The signed-in user the pack belongs to (packStore's LAST_USER_KEY), with
// its folder of decrypted copies.
export async function seedPackUser(userId: number) {
	await SecureStore.setItemAsync('zooapp_pack_user', String(userId))

	const dir = new Directory(Paths.document, 'cards', String(userId))

	dir.create()

	return dir
}

export function serveManifest(files: PackFile[], etag = '"manifest-1"') {
	return http.get(`${API}/cards/pack`, () =>
		HttpResponse.json(
			{ success: true, data: makeManifest(files) },
			{ headers: { ETag: etag } },
		),
	)
}

export function serveCards(cards: DeckCard[], etag = '"cards-1"') {
	return http.get(`${API}/cards`, () =>
		HttpResponse.json(
			{ success: true, data: cards },
			{ headers: { ETag: etag } },
		),
	)
}

// Serves pack files by URL and records which ones were downloaded.
export function serveFiles(bins: Record<string, Uint8Array>) {
	const downloaded: string[] = []
	const handler = http.get('http://cdn.test/:file', ({ request }) => {
		const body = bins[request.url]

		if (!body) return new HttpResponse(null, { status: 404 })

		downloaded.push(request.url)

		return HttpResponse.arrayBuffer(body.slice().buffer)
	})

	return { handler, downloaded }
}
