// In-memory expo-file-system, limited to the File/Directory API the offline
// pack uses (packStore, packSync, packCrypto). Downloads go through fetch, so
// MSW serves them like any other request.
const ROOT = 'file:///mock/'

const files = new Map<string, Uint8Array>()
const dirs = new Set<string>()

type PathPart = string | { uri: string }

function join(parts: PathPart[], isDirectory: boolean) {
	const [first, ...rest] = parts.map((part) =>
		typeof part === 'string' ? part : part.uri,
	)
	let uri = first.startsWith('file://') ? first : ROOT + first

	for (const part of rest) {
		uri = `${uri.replace(/\/?$/, '/')}${part.replace(/^\//, '')}`
	}

	uri = uri.replace(/\/+$/, '')

	return isDirectory ? `${uri}/` : uri
}

const parentOf = (uri: string) => uri.replace(/\/?[^/]+\/?$/, '/')

const nameOf = (uri: string) => uri.replace(/\/$/, '').split('/').pop() ?? ''

function createParents(uri: string) {
	for (let dir = parentOf(uri); dir.length > ROOT.length; dir = parentOf(dir)) {
		dirs.add(dir)
	}
}

export class Directory {
	uri: string

	constructor(...parts: PathPart[]) {
		this.uri = join(parts, true)
	}

	get name() {
		return nameOf(this.uri)
	}

	get exists() {
		return dirs.has(this.uri)
	}

	create() {
		createParents(this.uri)
		dirs.add(this.uri)
	}

	delete() {
		if (!this.exists) throw new Error(`Directory not found: ${this.uri}`)

		for (const uri of [...files.keys()]) {
			if (uri.startsWith(this.uri)) files.delete(uri)
		}

		for (const dir of [...dirs]) {
			if (dir.startsWith(this.uri)) dirs.delete(dir)
		}
	}

	list(): (File | Directory)[] {
		const children: (File | Directory)[] = []

		for (const uri of files.keys()) {
			if (parentOf(uri) === this.uri) children.push(new File(uri))
		}

		for (const dir of dirs) {
			if (dir !== this.uri && parentOf(dir) === this.uri) {
				children.push(new Directory(dir))
			}
		}

		return children
	}
}

export class File {
	uri: string

	constructor(...parts: PathPart[]) {
		this.uri = join(parts, false)
	}

	get name() {
		return nameOf(this.uri)
	}

	get exists() {
		return files.has(this.uri)
	}

	get size() {
		return files.get(this.uri)?.length ?? 0
	}

	get parentDirectory() {
		return new Directory(parentOf(this.uri))
	}

	write(content: string | Uint8Array) {
		if (!dirs.has(parentOf(this.uri))) {
			throw new Error(`Directory not found for ${this.uri}`)
		}

		files.set(
			this.uri,
			typeof content === 'string' ? new TextEncoder().encode(content) : content,
		)
	}

	async text() {
		return new TextDecoder().decode(this.read())
	}

	async bytes() {
		return this.read()
	}

	delete() {
		if (!files.delete(this.uri)) {
			throw new Error(`File not found: ${this.uri}`)
		}
	}

	moveSync(target: File) {
		const data = this.read()

		createParents(target.uri)
		files.set(target.uri, data)
		files.delete(this.uri)
		this.uri = target.uri
	}

	private read() {
		const data = files.get(this.uri)

		if (!data) throw new Error(`File not found: ${this.uri}`)

		return data
	}

	static async downloadFileAsync(url: string, destination: File) {
		const response = await fetch(url)

		if (!response.ok) throw new Error(`HTTP ${response.status}`)

		createParents(destination.uri)
		files.set(destination.uri, new Uint8Array(await response.arrayBuffer()))

		return destination
	}
}

type Progress = { bytesWritten: number; totalBytes: number }

type DownloadOptions = { onProgress?: (progress: Progress) => void }

type SavedDownload = { url: string; fileUri: string }

// Resumable download. pause() during a download makes it resolve null, like
// the native task; nothing partial is kept.
export class DownloadTask {
	private paused = false

	constructor(
		private url: string,
		private destination: File,
		private options: DownloadOptions = {},
	) {}

	async downloadAsync() {
		this.paused = false

		const response = await fetch(this.url)

		if (this.paused) return null
		if (!response.ok) throw new Error(`HTTP ${response.status}`)

		const data = new Uint8Array(await response.arrayBuffer())

		createParents(this.destination.uri)
		files.set(this.destination.uri, data)
		this.options.onProgress?.({
			bytesWritten: data.length,
			totalBytes: data.length,
		})

		return { uri: this.destination.uri }
	}

	resumeAsync() {
		return this.downloadAsync()
	}

	pause() {
		this.paused = true
	}

	savable(): SavedDownload {
		return { url: this.url, fileUri: this.destination.uri }
	}

	static fromSavable(saved: SavedDownload, options?: DownloadOptions) {
		return new DownloadTask(saved.url, new File(saved.fileUri), options)
	}
}

const DEFAULT_DISK_SPACE = 10 * 1024 ** 3

export const Paths = {
	document: new Directory('document'),
	cache: new Directory('cache'),
	availableDiskSpace: DEFAULT_DISK_SPACE,
}

export const __fs = { files, dirs }

// Read-only in expo-file-system's types; tests lower it to reach "no space".
export function __setAvailableDiskSpace(bytes: number) {
	Paths.availableDiskSpace = bytes
}

export function __reset() {
	files.clear()
	dirs.clear()
	Paths.availableDiskSpace = DEFAULT_DISK_SPACE
}
