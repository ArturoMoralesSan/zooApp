import NetInfo, { type NetInfoState } from '@react-native-community/netinfo'
import { DownloadTask, File, Paths } from 'expo-file-system'

import { isCellularState, isOfflineState } from '@/hooks/useNetworkStatus'
import type { OwnedCard } from '@/types/cards'
import type { PackFile, PackKind, PackRef } from '@/types/pack'

import { clearCardsCache, getStoredCards } from './cards'
import { getCellularUpdates, getPackManifest } from './pack'
import { decrypt, sha256 } from './packCrypto'
import {
	assetKey,
	binFile,
	copyFile,
	copyName,
	deleteFile,
	emptyPackIndex,
	getLastUserId,
	type PackIndex,
	packsDir,
	partFile,
	readPackIndex,
	readUserIndex,
	setLastUserId,
	type UserIndex,
	userDir,
	wipePacks,
	wipeUser,
	writePackIndex,
	writeUserIndex,
} from './packStore'

// Offline pack sync: downloads the encrypted catalog file by file, decrypts
// the user's own cards and tells the screens where each asset lives. Plain
// module state + a tiny store, read through usePackStatus().

export type PackFileState =
	'done' | 'downloading' | 'queued' | 'update' | 'error' | 'noSpace'

export type PackFileStatus = {
	id: string
	card_id: number
	kind: PackKind
	bytes: number
	state: PackFileState
	// 0–1 while downloading.
	progress: number
}

export type PackActivity = 'idle' | 'checking' | 'downloading' | 'noSpace'

export type PackStatus = {
	loaded: boolean
	activity: PackActivity
	// The user asked for the pack at least once (see PackIndex.enabled).
	enabled: boolean
	hasManifest: boolean
	files: PackFileStatus[]
	totalCount: number
	totalBytes: number
	doneCount: number
	doneBytes: number
	// Not downloaded yet (first downloads and updates).
	pendingCount: number
	pendingBytes: number
	// Of the pending ones, new versions of files already on the phone.
	updateCount: number
	failedCount: number
	// Overall 0–1, counting the file in progress.
	progress: number
	lastChecked: number | null
	// Bumps when a local copy is added or removed, so assets re-resolve.
	version: number
}

export type AssetSource = 'local' | 'pack' | 'stale' | 'remote' | 'none'

export type CardAsset = {
	uri: string | null
	source: AssetSource
}

const PROGRESS_INTERVAL = 250
// Free space kept on top of the download (+ its decrypted copy).
const SPACE_MARGIN = 20 * 1024 * 1024

let index: PackIndex = emptyPackIndex()
let userId: number | null = null
let userIndex: UserIndex = {}
let loading: Promise<void> | null = null

let running: Promise<void> | null = null
let rerunAsUser = false
let stopRequested = false
let currentTask: DownloadTask | null = null
let current: { id: string; progress: number } | null = null
let lastProgressEmit = 0
let noSpace = false
const failed = new Set<string>()

// Store ----------------------------------------------------------------------

const emptyStatus: PackStatus = {
	loaded: false,
	activity: 'idle',
	enabled: false,
	hasManifest: false,
	files: [],
	totalCount: 0,
	totalBytes: 0,
	doneCount: 0,
	doneBytes: 0,
	pendingCount: 0,
	pendingBytes: 0,
	updateCount: 0,
	failedCount: 0,
	progress: 0,
	lastChecked: null,
	version: 0,
}

let status = emptyStatus
const listeners = new Set<() => void>()

export function subscribePack(listener: () => void) {
	listeners.add(listener)

	return () => {
		listeners.delete(listener)
	}
}

export const getPackStatus = () => status

function emit(patch: Partial<PackStatus> = {}) {
	status = { ...status, ...patch, ...summarize() }
	listeners.forEach((listener) => listener())
}

const bumpVersion = () => emit({ version: status.version + 1 })

function isUpdate(file: PackFile) {
	const key = assetKey(file.card_id, file.kind)
	const copy = userIndex[key]

	return (
		index.replaced.includes(key) || (copy !== undefined && copy.id !== file.id)
	)
}

function fileState(file: PackFile): PackFileState {
	if (index.files[file.id]) return 'done'
	if (current?.id === file.id) return 'downloading'
	if (failed.has(file.id)) return 'error'
	if (noSpace) return 'noSpace'

	return isUpdate(file) ? 'update' : 'queued'
}

function summarize() {
	const manifest = index.manifest
	const files: PackFileStatus[] = (manifest?.files ?? []).map((file) => ({
		id: file.id,
		card_id: file.card_id,
		kind: file.kind,
		bytes: file.bytes,
		state: fileState(file),
		progress: current?.id === file.id ? current.progress : 0,
	}))

	const done = files.filter((file) => file.state === 'done')
	const pending = files.filter((file) => file.state !== 'done')
	const sum = (list: PackFileStatus[]) =>
		list.reduce((total, file) => total + file.bytes, 0)

	const totalBytes = sum(files)
	const doneBytes = sum(done)
	const partial = files.find((file) => file.state === 'downloading')
	const progressBytes =
		doneBytes + (partial ? partial.bytes * partial.progress : 0)

	return {
		loaded: status.loaded,
		enabled: index.enabled,
		hasManifest: manifest !== null,
		files,
		totalCount: files.length,
		totalBytes,
		doneCount: done.length,
		doneBytes,
		pendingCount: pending.length,
		pendingBytes: sum(pending),
		updateCount: pending.filter((file) => file.state === 'update').length,
		failedCount: pending.filter((file) => file.state === 'error').length,
		progress: totalBytes > 0 ? progressBytes / totalBytes : 0,
		lastChecked: index.checkedAt,
	}
}

function setProgress(id: string, progress: number) {
	current = { id, progress: Math.min(1, Math.max(0, progress)) }

	const now = Date.now()

	if (now - lastProgressEmit >= PROGRESS_INTERVAL) {
		lastProgressEmit = now
		emit()
	}
}

// State on disk ----------------------------------------------------------------

function loadState() {
	loading ??= (async () => {
		index = await readPackIndex()
		userId = await getLastUserId()
		userIndex = userId !== null ? await readUserIndex(userId) : {}
		status = { ...status, loaded: true }
		emit()
	})()

	return loading
}

function savePackIndex() {
	try {
		writePackIndex(index)
	} catch {
		// Rebuilt from the files on the next sync.
	}
}

// Copies are written one at a time, so two screens resolving the same card
// never race on the user's index.
let userQueue: Promise<unknown> = Promise.resolve()

function withUser<T>(task: () => Promise<T>): Promise<T> {
	const next = userQueue.then(task, task)

	userQueue = next.catch(() => undefined)

	return next
}

function saveUserIndex() {
	if (userId === null) return

	try {
		writeUserIndex(userId, userIndex)
	} catch {
		// The copies stay; the next write records them.
	}
}

function localCopy(cardId: number, kind: PackKind) {
	if (userId === null) return null

	const copy = userIndex[assetKey(cardId, kind)]

	if (!copy) return null

	const file = copyFile(userId, copy.name)

	return file.exists ? { ...copy, uri: file.uri } : null
}

// Stores a decrypted or downloaded file as the card's current copy, then
// deletes the previous version.
function storeCopy(cardId: number, kind: PackKind, id: string, source: File) {
	if (userId === null) return null

	const key = assetKey(cardId, kind)
	const previous = userIndex[key]
	const name = copyName(cardId, kind, id)
	const target = copyFile(userId, name)

	source.moveSync(target, { overwrite: true })
	userIndex[key] = { id, name, bytes: target.size }
	saveUserIndex()

	if (previous && previous.name !== name) {
		deleteFile(copyFile(userId, previous.name))
	}

	bumpVersion()

	return target.uri
}

function removeCopy(key: string) {
	const copy = userIndex[key]

	if (!copy || userId === null) return

	deleteFile(copyFile(userId, copy.name))
	delete userIndex[key]
}

async function decryptToCopy(cardId: number, kind: PackKind, ref: PackRef) {
	if (userId === null || !index.files[ref.id]) return null

	const bin = binFile(ref.id)

	if (!bin.exists) return null

	let plain: Uint8Array

	try {
		plain = await decrypt(bin, ref.key)
	} catch {
		// Wrong tag: the .bin is bad. Drop it so the next sync downloads it
		// again; this time the asset comes from its URL.
		deleteFile(bin)
		delete index.files[ref.id]
		savePackIndex()
		emit()

		return null
	}

	const dir = userDir(userId)

	if (!dir.exists) dir.create({ intermediates: true, idempotent: true })

	const temp = new File(dir, `${ref.id}.tmp`)

	temp.write(plain)

	return storeCopy(cardId, kind, ref.id, temp)
}

// Asset resolution ---------------------------------------------------------------

async function mustSaveData(state?: NetInfoState) {
	const net = state ?? (await NetInfo.fetch())

	if (isOfflineState(net)) return true

	return isCellularState(net) && !(await getCellularUpdates())
}

const inflight = new Map<string, Promise<CardAsset>>()

export type AssetRequest = {
	cardId?: number
	kind: PackKind
	ref: PackRef | null | undefined
	url: string | null
}

// Whether that file version is already on the phone (pack or copy), so a
// screen can tell a quick decrypt from a download.
export function isOnDevice(ref: PackRef | null | undefined) {
	if (!ref) return false

	return (
		index.files[ref.id] !== undefined ||
		Object.values(userIndex).some((copy) => copy.id === ref.id)
	)
}

// Fast path for the first render: the current copy, if already on the phone.
export function peekCardAsset({ cardId, kind, ref }: AssetRequest) {
	if (cardId === undefined || !ref) return null

	const copy = localCopy(cardId, kind)

	return copy && copy.id === ref.id ? copy.uri : null
}

// Where a card's file comes from, in order: the current decrypted copy, the
// pack (decrypted once), an old copy while saving data, the URL (stored for
// next time), or nothing.
export function resolveCardAsset(request: AssetRequest): Promise<CardAsset> {
	const key = `${request.cardId}-${request.kind}-${request.ref?.id}-${request.url}`
	const pending = inflight.get(key)

	if (pending) return pending

	const promise = resolve(request).finally(() => inflight.delete(key))

	inflight.set(key, promise)

	return promise
}

async function resolve({
	cardId,
	kind,
	ref,
	url,
}: AssetRequest): Promise<CardAsset> {
	await loadState()

	const remote: CardAsset = url
		? { uri: url, source: 'remote' }
		: { uri: null, source: 'none' }

	// The duel's card has no id: the catalog knows it by the file id.
	const id =
		cardId ??
		(ref
			? index.manifest?.files.find((file) => file.id === ref.id)?.card_id
			: undefined)

	if (userId === null || id === undefined || ref === null) return remote

	const copy = localCopy(id, kind)

	if (copy && ref && copy.id === ref.id) {
		return { uri: copy.uri, source: 'local' }
	}

	if (ref) {
		const uri = await withUser(() => decryptToCopy(id, kind, ref))

		if (uri) return { uri, source: 'pack' }
	}

	if (copy && (await mustSaveData())) {
		return { uri: copy.uri, source: 'stale' }
	}

	if (url && ref) {
		const uri = await withUser(() => downloadCopy(id, kind, ref.id, url))

		if (uri) return { uri, source: 'remote' }
	}

	if (url) return remote

	return copy ? { uri: copy.uri, source: 'stale' } : remote
}

// Downloads the plain file once and keeps it, instead of letting the image
// or the 3D view fetch it on every visit.
async function downloadCopy(
	cardId: number,
	kind: PackKind,
	id: string,
	url: string,
) {
	if (userId === null) return null

	const fresh = localCopy(cardId, kind)

	if (fresh?.id === id) return fresh.uri

	const dir = userDir(userId)

	if (!dir.exists) dir.create({ intermediates: true, idempotent: true })

	const temp = new File(dir, `${id}.download`)

	try {
		deleteFile(temp)
		await File.downloadFileAsync(url, temp)

		return storeCopy(cardId, kind, id, temp)
	} catch {
		deleteFile(temp)

		return null
	}
}

// Sync ------------------------------------------------------------------------------

const ownedCards = async () =>
	(await getStoredCards()).filter((card): card is OwnedCard => card.encountered)

// Re-reads the catalog; with `force` it ignores the ETag (after a 404 or a
// bad hash, the stored catalog is probably out of date).
async function refreshManifest(force = false) {
	const result = await getPackManifest(force ? null : index.etag)

	if (result) {
		index.etag = result.etag
		index.manifest = result.manifest
	}

	index.checkedAt = Date.now()
	savePackIndex()
}

// Compares the catalog with what's on the phone, file by file.
async function reconcile() {
	const manifest = index.manifest

	if (!manifest) return

	const ids = new Set(manifest.files.map((file) => file.id))
	const keys = new Set(
		manifest.files.map((file) => assetKey(file.card_id, file.kind)),
	)

	for (const [id, entry] of Object.entries(index.files)) {
		const key = assetKey(entry.card_id, entry.kind)

		// Orphan: a newer version replaced it, or the file left the catalog.
		if (!ids.has(id)) {
			deleteFile(binFile(id))
			delete index.files[id]

			if (keys.has(key) && !index.replaced.includes(key))
				index.replaced.push(key)
		} else if (!binFile(id).exists) {
			delete index.files[id]
		}
	}

	const downloadedKeys = new Set(
		Object.values(index.files).map((entry) =>
			assetKey(entry.card_id, entry.kind),
		),
	)

	index.replaced = index.replaced.filter(
		(key) => keys.has(key) && !downloadedKeys.has(key),
	)

	if (index.resume && !ids.has(index.resume.id)) index.resume = null

	// Stray files: .bin not in the index, parts not being resumed.
	if (packsDir.exists && !current) {
		for (const item of packsDir.list()) {
			if (!(item instanceof File)) continue

			const bin = item.name.match(/^(.+)\.bin$/)
			const part = item.name.match(/^(.+)\.bin\.part$/)

			if (
				(bin && !index.files[bin[1]]) ||
				(part && index.resume?.id !== part[1])
			) {
				deleteFile(item)
			}
		}
	}

	savePackIndex()

	// The user's copies: drop the ones the server says no longer exist. An
	// unknown list (never loaded) leaves them alone.
	const cards = await getStoredCards()

	if (userId === null || cards.length === 0) return

	await withUser(async () => {
		const owned = new Map(
			cards
				.filter((card): card is OwnedCard => card.encountered)
				.map((card) => [card.id, card]),
		)

		for (const key of Object.keys(userIndex)) {
			const [cardId, kind] = key.split(/-(.+)/) as [string, PackKind]
			const card = owned.get(Number(cardId))

			if (!card || card.pack?.[kind] === null) removeCopy(key)
		}

		saveUserIndex()
	})
}

// Decrypts every owned card whose current file is in the pack, so the
// collection, 3D view and AR work offline.
async function decryptOwned() {
	if (userId === null) return

	for (const card of await ownedCards()) {
		for (const [kind, ref] of Object.entries(card.pack ?? {}) as [
			PackKind,
			PackRef | null,
		][]) {
			if (!ref || !index.files[ref.id]) continue

			const copy = localCopy(card.id, kind)

			if (copy?.id === ref.id) continue

			await withUser(() => decryptToCopy(card.id, kind, ref))
		}
	}
}

type DownloadResult = 'done' | 'paused' | 'stale' | 'error'

async function downloadOne(
	file: PackFile,
	fresh = false,
): Promise<DownloadResult> {
	const part = partFile(file.id)
	const saved = !fresh && index.resume?.id === file.id ? index.resume : null
	const onProgress = ({
		bytesWritten,
		totalBytes,
	}: {
		bytesWritten: number
		totalBytes: number
	}) =>
		setProgress(
			file.id,
			bytesWritten / (totalBytes > 0 ? totalBytes : file.bytes),
		)

	if (!packsDir.exists)
		packsDir.create({ intermediates: true, idempotent: true })

	if (!saved) deleteFile(part)

	index.resume = null
	setProgress(file.id, 0)

	const task = saved
		? DownloadTask.fromSavable(saved.state, { onProgress })
		: new DownloadTask(file.url, part, { onProgress })

	currentTask = task

	try {
		const result = saved ? await task.resumeAsync() : await task.downloadAsync()

		if (!result) {
			index.resume = { id: file.id, state: task.savable() }
			savePackIndex()

			return 'paused'
		}
	} catch {
		deleteFile(part)

		// A resume the server didn't accept: start that file over.
		if (saved && !stopRequested) return downloadOne(file, true)

		return stopRequested || (await mustSaveData()) ? 'paused' : 'error'
	} finally {
		currentTask = null
	}

	if (part.size !== file.bytes || (await sha256(part)) !== file.sha256) {
		deleteFile(part)

		// A server that answers a resume with 200 instead of 206 (php artisan
		// serve) appends the whole file: start over, it's not an error.
		if (saved) return downloadOne(file, true)

		return 'stale'
	}

	part.moveSync(binFile(file.id), { overwrite: true })
	index.files[file.id] = {
		card_id: file.card_id,
		kind: file.kind,
		bytes: file.bytes,
	}
	index.replaced = index.replaced.filter(
		(key) => key !== assetKey(file.card_id, file.kind),
	)
	savePackIndex()

	return 'done'
}

const pendingFiles = () =>
	(index.manifest?.files ?? []).filter(
		(file) => !index.files[file.id] && !failed.has(file.id),
	)

async function downloadAll() {
	let retried = false

	for (;;) {
		const file = pendingFiles()[0]

		if (!file || stopRequested) return

		const result = await downloadOne(file)

		current = null

		if (result === 'paused') return

		if (result === 'stale') {
			// The file was replaced mid-download (404 or new hash): re-read
			// the catalog and try once more.
			if (!retried) {
				retried = true
				await refreshManifest(true)
				await reconcile()
			} else {
				failed.add(file.id)
			}
		} else if (result === 'error') {
			failed.add(file.id)
		}

		emit()
	}
}

function hasSpaceFor(files: PackFile[]) {
	const bytes = files.reduce((total, file) => total + file.bytes, 0)

	// Owned cards keep a decrypted copy too, so count each file twice.
	return Paths.availableDiskSpace > bytes * 2 + SPACE_MARGIN
}

async function runSync(userTriggered: boolean) {
	await loadState()

	if (userId === null) return

	stopRequested = false

	const net = await NetInfo.fetch()

	if (isOfflineState(net)) {
		emit({ activity: 'idle' })

		return
	}

	emit({ activity: 'checking' })

	try {
		await refreshManifest()
	} catch {
		// Offline or server down: keep the stored catalog. Never a modal.
	}

	if (userTriggered) {
		failed.clear()
		index.enabled = true
		savePackIndex()
	}

	await reconcile()
	await decryptOwned()

	const queue = pendingFiles()
	const allowed =
		index.enabled &&
		(userTriggered || !isCellularState(net) || (await getCellularUpdates()))

	if (queue.length === 0 || !allowed) {
		noSpace = false
		emit({ activity: 'idle' })

		return
	}

	noSpace = !hasSpaceFor(queue)

	if (noSpace) {
		emit({ activity: 'noSpace' })

		return
	}

	emit({ activity: 'downloading' })
	await downloadAll()
	current = null
	await decryptOwned()
	emit({ activity: 'idle' })
}

// Runs a sync, or joins the one in progress. A user-triggered request
// during an automatic run runs again afterwards, so it can use mobile data.
export function syncPack({ userTriggered = false } = {}) {
	if (running) {
		if (userTriggered) rerunAsUser = true

		return running
	}

	running = runSync(userTriggered)
		.catch(() => {
			emit({ activity: 'idle' })
		})
		.finally(() => {
			running = null

			if (rerunAsUser) {
				rerunAsUser = false
				syncPack({ userTriggered: true })
			}
		})

	return running
}

// App in the background or connection lost: pause the file in progress so
// it can resume where it stopped.
export function pausePackSync() {
	stopRequested = true
	currentTask?.pause()
}

export async function setPackUser(id: number) {
	await loadState()

	if (userId === id) return

	userId = id
	await setLastUserId(id)
	userIndex = await readUserIndex(id)
	bumpVersion()
}

// Logout: the user's copies and card list go; the shared .bin files stay.
export async function resetPackUser() {
	await loadState()
	pausePackSync()
	await running

	if (userId !== null) wipeUser(userId)

	userId = null
	userIndex = {}
	clearCardsCache()
	await setLastUserId(null)
	bumpVersion()
}

// "Liberar espacio": deletes the pack and the decrypted copies, and stops
// background downloads until the user asks for the pack again.
export async function freePackSpace() {
	await loadState()
	pausePackSync()
	await running

	wipePacks()

	// Copies only: the saved card list keeps the collection working offline.
	await withUser(async () => {
		Object.keys(userIndex).forEach(removeCopy)
		saveUserIndex()
	})

	index = {
		...emptyPackIndex(),
		etag: index.etag,
		manifest: index.manifest,
		checkedAt: index.checkedAt,
	}
	failed.clear()
	noSpace = false
	savePackIndex()
	bumpVersion()
}

export function setPackEnabled(enabled: boolean) {
	index.enabled = enabled
	savePackIndex()
	emit()
}
