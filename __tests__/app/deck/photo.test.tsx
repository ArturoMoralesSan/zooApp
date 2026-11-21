import { beforeEach, describe, expect, jest, test } from '@jest/globals'
import { fireEvent, screen } from '@testing-library/react-native'
import { File } from 'expo-file-system'
import {
	Asset,
	type PermissionResponse,
	requestPermissionsAsync,
} from 'expo-media-library'
import * as SecureStore from 'expo-secure-store'
import { shareAsync } from 'expo-sharing'

import PhotoScreen from '@/app/deck/photo'
import { photosDir } from '@/services/photo'

import { renderWithProviders } from '../../../test-utils/render'
import { routerSpies, searchParams } from '../../../test-utils/router'

jest.mock(
	'expo-router',
	() =>
		jest.requireActual<typeof import('../../../test-utils/router')>(
			'../../../test-utils/router',
		).expoRouterMock,
)
jest.mock(
	'react-native-safe-area-context',
	() =>
		jest.requireActual<{ default: object }>(
			'react-native-safe-area-context/jest/mock',
		).default,
)
// Native modules: the gallery, the share menu and view capture.
jest.mock('expo-media-library', () => ({
	requestPermissionsAsync: jest.fn(),
	Asset: { create: jest.fn() },
}))
jest.mock('expo-sharing', () => ({ shareAsync: jest.fn() }))
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn() }))

const permission = (granted: boolean) =>
	({ granted }) as unknown as PermissionResponse

// The framed photo the camera screen left in the photos folder.
function framedPhoto() {
	photosDir.create()
	const file = new File(photosDir, 'zoo-1.jpg')

	file.write('jpeg')

	return file
}

function openWith(params: Record<string, string>) {
	searchParams.mockReturnValue(params)

	return renderWithProviders(<PhotoScreen />)
}

describe('share screen (A-32)', () => {
	beforeEach(async () => {
		jest.clearAllMocks()
		// Signed in: no redirect to /login.
		await SecureStore.setItemAsync('zooapp_token', 'token-de-prueba')
	})

	test('saves the photo to the gallery', async () => {
		const photo = framedPhoto()
		jest.mocked(requestPermissionsAsync).mockResolvedValue(permission(true))
		await openWith({ uri: photo.uri, id: '5', camera: 'selfie' })

		await fireEvent.press(await screen.findByText('Guardar en galería'))

		expect(requestPermissionsAsync).toHaveBeenCalledWith(true)
		expect(Asset.create).toHaveBeenCalledWith(photo.uri)
		expect(await screen.findByText('Foto guardada')).toBeTruthy()
		expect(screen.getByText('Guardada en tu galería')).toBeTruthy()
	})

	test('explains how to allow saving when it was denied', async () => {
		const photo = framedPhoto()
		jest.mocked(requestPermissionsAsync).mockResolvedValue(permission(false))
		await openWith({ uri: photo.uri, id: '5', camera: 'selfie' })

		await fireEvent.press(await screen.findByText('Guardar en galería'))

		expect(await screen.findByText('No se pudo guardar')).toBeTruthy()
		expect(screen.getByText(/Permite que ZooApp guarde fotos/)).toBeTruthy()
		expect(Asset.create).not.toHaveBeenCalled()
	})

	test('shares the photo through the share menu', async () => {
		const photo = framedPhoto()
		await openWith({ uri: photo.uri, id: '5', camera: 'ar' })

		await fireEvent.press(await screen.findByText('Compartir'))

		expect(shareAsync).toHaveBeenCalledWith(
			photo.uri,
			expect.objectContaining({ mimeType: 'image/jpeg' }),
		)
	})

	test('goes back to the selfie it came from', async () => {
		const photo = framedPhoto()
		await openWith({
			uri: photo.uri,
			id: '5',
			mode: 'card',
			camera: 'selfie',
			from: 'ar',
		})

		await fireEvent.press(await screen.findByLabelText('Regresar'))

		expect(routerSpies.replace).toHaveBeenCalledWith(
			'/deck/selfie/5?mode=card&from=ar',
		)
	})

	test('goes back to AR for an AR photo', async () => {
		const photo = framedPhoto()
		await openWith({ uri: photo.uri, id: '5', camera: 'ar' })

		await fireEvent.press(await screen.findByLabelText('Regresar'))

		expect(routerSpies.replace).toHaveBeenCalledWith('/deck/ar/5?mode=model')
	})

	test('deletes the photos when leaving', async () => {
		const photo = framedPhoto()
		const view = await openWith({ uri: photo.uri, id: '5', camera: 'ar' })

		expect(photosDir.exists).toBe(true)

		await view.unmount()

		expect(photosDir.exists).toBe(false)
	})
})
