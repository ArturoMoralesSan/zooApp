import { Directory, File, Paths } from 'expo-file-system'
import { Asset, requestPermissionsAsync } from 'expo-media-library'
import { shareAsync } from 'expo-sharing'
import type { RefObject } from 'react'
import type { View } from 'react-native'
import { captureRef } from 'react-native-view-shot'

// AR photos and selfies (A-29 → A-32). They stay on the phone: every shot
// lives in the cache until the visitor saves or shares it, and the folder is
// cleared when the flow ends. Nothing is uploaded.
export const photosDir = new Directory(Paths.cache, 'photos')

// The visitor didn't allow saving to the gallery.
export class PhotoPermissionError extends Error {
	constructor() {
		super('Sin permiso para guardar en la galería')
		this.name = 'PhotoPermissionError'
	}
}

// The part of ViroARSceneNavigator that takes screenshots of its view.
export type ScreenshotSource = {
	_takeScreenshot: (fileName: string, saveToCameraRoll: boolean) => unknown
}

type ScreenshotResult = { success?: boolean; url?: string; errorCode?: number }

// Unique within a run, even for two shots in the same millisecond.
let shots = 0
const shotName = (kind: string) => `${kind}-${Date.now()}-${++shots}`

const asFileUri = (path: string) =>
	path.startsWith('file://') ? path : `file://${path}`

// Moves a capture into the photos folder, so clearPhotos() finds it.
function keep(path: string, name: string) {
	if (!photosDir.exists)
		photosDir.create({ intermediates: true, idempotent: true })

	const file = new File(asFileUri(path))

	file.moveSync(new File(photosDir, `${name}.jpg`), { overwrite: true })

	return file.uri
}

// The AR view as it looks now: camera and animal, without the controls.
export async function takeArPhoto(source: ScreenshotSource) {
	const name = shotName('ar')
	const result = (await source._takeScreenshot(name, false)) as
		ScreenshotResult | undefined

	if (!result?.success || !result.url) {
		throw new Error(`No se pudo tomar la foto (${result?.errorCode ?? '?'})`)
	}

	return keep(result.url, name)
}

// The framed photo (PhotoFrame) as the image that gets saved or shared.
export async function captureFrame(view: RefObject<View | null>) {
	const path = await captureRef(view, {
		format: 'jpg',
		quality: 0.92,
		result: 'tmpfile',
	})

	return keep(path, shotName('zoo'))
}

// Write-only access: the app adds photos but never reads the gallery.
export async function savePhoto(uri: string) {
	const { granted } = await requestPermissionsAsync(true)

	if (!granted) throw new PhotoPermissionError()

	await Asset.create(uri)
}

export function sharePhoto(uri: string) {
	return shareAsync(uri, {
		mimeType: 'image/jpeg',
		dialogTitle: 'Comparte tu foto',
	})
}

export function deletePhoto(uri: string) {
	try {
		const file = new File(uri)

		if (file.exists) file.delete()
	} catch {
		// Already gone: the folder is cleared at the end anyway.
	}
}

export function clearPhotos() {
	try {
		if (photosDir.exists) photosDir.delete()
	} catch {
		// Locked or gone: the cache is the system's to clean.
	}
}
