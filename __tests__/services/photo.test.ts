import { beforeEach, describe, expect, jest, test } from '@jest/globals'
import { File, Paths } from 'expo-file-system'
import {
	Asset,
	type PermissionResponse,
	requestPermissionsAsync,
} from 'expo-media-library'
import { shareAsync } from 'expo-sharing'
import { captureRef } from 'react-native-view-shot'

import {
	captureFrame,
	clearPhotos,
	deletePhoto,
	PhotoPermissionError,
	photosDir,
	savePhoto,
	sharePhoto,
	takeArPhoto,
} from '@/services/photo'

// Native modules: the gallery, the share menu and view capture.
jest.mock('expo-media-library', () => ({
	requestPermissionsAsync: jest.fn(),
	Asset: { create: jest.fn() },
}))
jest.mock('expo-sharing', () => ({ shareAsync: jest.fn() }))
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn() }))

const permission = (granted: boolean) =>
	({ granted }) as unknown as PermissionResponse

// A file where a native capture would leave it (outside the photos folder).
function nativeCapture(name: string) {
	Paths.cache.create()
	const file = new File(Paths.cache, name)

	file.write('jpeg')

	return file
}

describe('photo service', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	test('keeps an AR screenshot in the photos folder', async () => {
		const shot = nativeCapture('viro.jpg')
		// Viro answers with a plain path, without file://.
		const source = {
			_takeScreenshot: jest.fn(async () => ({
				success: true,
				url: shot.uri.replace('file://', ''),
			})),
		}

		const uri = await takeArPhoto(source)

		expect(source._takeScreenshot).toHaveBeenCalledWith(
			expect.stringMatching(/^ar-/),
			false,
		)
		expect(uri.startsWith(photosDir.uri)).toBe(true)
		expect(new File(uri).exists).toBe(true)
		expect(shot.exists).toBe(false)
	})

	test('fails when the AR screenshot fails', async () => {
		const source = {
			_takeScreenshot: jest.fn(async () => ({ success: false, errorCode: 2 })),
		}

		await expect(takeArPhoto(source)).rejects.toThrow('(2)')
	})

	test('captures the frame as a JPEG in the photos folder', async () => {
		const capture = nativeCapture('snapshot.jpg')
		jest.mocked(captureRef).mockResolvedValue(capture.uri)

		const uri = await captureFrame({ current: null })

		expect(captureRef).toHaveBeenCalledWith(
			{ current: null },
			expect.objectContaining({ format: 'jpg', result: 'tmpfile' }),
		)
		expect(uri.startsWith(photosDir.uri)).toBe(true)
	})

	test('saves with write-only access', async () => {
		jest.mocked(requestPermissionsAsync).mockResolvedValue(permission(true))

		await savePhoto('file:///mock/cache/photos/zoo.jpg')

		expect(requestPermissionsAsync).toHaveBeenCalledWith(true)
		expect(Asset.create).toHaveBeenCalledWith(
			'file:///mock/cache/photos/zoo.jpg',
		)
	})

	test("doesn't save without permission", async () => {
		jest.mocked(requestPermissionsAsync).mockResolvedValue(permission(false))

		await expect(savePhoto('file:///mock/x.jpg')).rejects.toBeInstanceOf(
			PhotoPermissionError,
		)
		expect(Asset.create).not.toHaveBeenCalled()
	})

	test('shares as a JPEG through the share menu', async () => {
		await sharePhoto('file:///mock/cache/photos/zoo.jpg')

		expect(shareAsync).toHaveBeenCalledWith(
			'file:///mock/cache/photos/zoo.jpg',
			expect.objectContaining({ mimeType: 'image/jpeg' }),
		)
	})

	test('deletes one photo, then the whole folder', async () => {
		const first = nativeCapture('a.jpg')
		const second = nativeCapture('b.jpg')
		jest
			.mocked(captureRef)
			.mockResolvedValueOnce(first.uri)
			.mockResolvedValueOnce(second.uri)
		const kept = await captureFrame({ current: null })
		const other = await captureFrame({ current: null })

		deletePhoto(kept)
		expect(new File(kept).exists).toBe(false)
		expect(new File(other).exists).toBe(true)

		clearPhotos()
		expect(new File(other).exists).toBe(false)
		expect(photosDir.exists).toBe(false)

		// Nothing left to delete: no error either.
		expect(() => clearPhotos()).not.toThrow()
		expect(() => deletePhoto(kept)).not.toThrow()
	})
})
