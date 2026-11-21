import { beforeEach, describe, expect, jest, test } from '@jest/globals'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { File, Paths } from 'expo-file-system'
import { captureRef } from 'react-native-view-shot'

import { PhotoReview } from '@/components/ar/PhotoReview'
import { photosDir } from '@/services/photo'

// Native modules the photo service loads.
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn() }))
jest.mock('expo-media-library', () => ({}))
jest.mock('expo-sharing', () => ({}))
jest.mock(
	'react-native-safe-area-context',
	() =>
		jest.requireActual<{ default: object }>(
			'react-native-safe-area-context/jest/mock',
		).default,
)

const SHOT = 'file:///mock/cache/photos/ar-1.jpg'
// expo-image's load event, as the native view sends it. A new object each
// time: expo-image redefines properties on the event it gets.
const loaded = () => ({
	nativeEvent: { source: { width: 720, height: 1612 } },
})

async function renderReview(uri: string | null = SHOT) {
	const props = {
		onRetake: jest.fn(),
		onUse: jest.fn(),
		onError: jest.fn(),
	}

	await render(<PhotoReview uri={uri} name='Mapache' area='Selva' {...props} />)

	return { props }
}

describe('PhotoReview', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	test('shows the shot in the zoo frame', async () => {
		await renderReview()

		expect(await screen.findByText('¿Te gusta tu foto?')).toBeTruthy()
		expect(screen.getByText('Con Mapache')).toBeTruthy()
		expect(screen.getByText('Zoológico Sahuatoba · Selva')).toBeTruthy()
		expect(screen.getByLabelText('Logo del Zoológico Sahuatoba')).toBeTruthy()
	})

	test('takes the photo again', async () => {
		const { props } = await renderReview()

		await fireEvent.press(await screen.findByText('Repetir'))

		expect(props.onRetake).toHaveBeenCalled()
	})

	test('keeps the framed photo once the shot has loaded', async () => {
		Paths.cache.create()
		const capture = new File(Paths.cache, 'frame.jpg')
		capture.write('jpeg')
		jest.mocked(captureRef).mockResolvedValue(capture.uri)
		const { props } = await renderReview()

		// Not before the shot is drawn: the frame would be captured empty.
		await fireEvent.press(await screen.findByText('Usar foto'))
		expect(props.onUse).not.toHaveBeenCalled()

		await fireEvent(screen.getByLabelText('Foto con Mapache'), 'load', loaded())
		await fireEvent.press(screen.getByText('Usar foto'))

		expect(props.onUse).toHaveBeenCalledWith(
			expect.stringContaining(photosDir.uri),
		)
	})

	test('reports a failed capture', async () => {
		jest.mocked(captureRef).mockRejectedValue(new Error('No view'))
		const { props } = await renderReview()

		await fireEvent(
			await screen.findByLabelText('Foto con Mapache'),
			'load',
			loaded(),
		)
		await fireEvent.press(screen.getByText('Usar foto'))

		expect(props.onError).toHaveBeenCalled()
		expect(props.onUse).not.toHaveBeenCalled()
	})

	test('shows nothing without a shot', async () => {
		await renderReview(null)

		expect(screen.queryByText('¿Te gusta tu foto?')).toBeNull()
	})
})
