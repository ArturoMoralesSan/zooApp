import { expect, jest, test } from '@jest/globals'
import * as SecureStore from 'expo-secure-store'

import {
	getArPlacement,
	getGraphicsCustom,
	getGraphicsQuality,
	setArPlacement,
	setGraphicsCustom,
	setGraphicsQuality,
} from '@/services/preferences'
import { GRAPHICS_PRESETS } from '@/utils/settings'

const KEY = 'zooapp_pref_ar_placement'

test('placement is on a surface until the user picks another one', async () => {
	expect(await getArPlacement()).toBe('plane')

	await setArPlacement('auto')
	expect(await SecureStore.getItemAsync(KEY)).toBe('auto')
	expect(await getArPlacement()).toBe('auto')

	await setArPlacement('plane')
	expect(await getArPlacement()).toBe('plane')
})

test('an unknown or unreadable value falls back to a surface', async () => {
	await SecureStore.setItemAsync(KEY, 'sideways')
	expect(await getArPlacement()).toBe('plane')

	jest
		.mocked(SecureStore.getItemAsync)
		.mockRejectedValueOnce(new Error('keystore'))
	expect(await getArPlacement()).toBe('plane')
})

test('a failed save is not an error', async () => {
	jest
		.mocked(SecureStore.setItemAsync)
		.mockRejectedValueOnce(new Error('keystore'))

	await expect(setArPlacement('plane')).resolves.toBeUndefined()
})

test('graphics are automatic until the user picks a level', async () => {
	expect(await getGraphicsQuality()).toBe('auto')

	await setGraphicsQuality('saver')
	expect(await SecureStore.getItemAsync('zooapp_pref_graphics')).toBe('saver')
	expect(await getGraphicsQuality()).toBe('saver')

	await SecureStore.setItemAsync('zooapp_pref_graphics', 'ultra')
	expect(await getGraphicsQuality()).toBe('auto')
})

test('the custom mix is saved, and starts from Alta', async () => {
	expect(await getGraphicsCustom()).toEqual(GRAPHICS_PRESETS.high)

	const mix = { ...GRAPHICS_PRESETS.high, view360Scenario: false }

	await setGraphicsCustom(mix)
	expect(await getGraphicsCustom()).toEqual(mix)
})

test('a damaged custom mix keeps what it can', async () => {
	await SecureStore.setItemAsync(
		'zooapp_pref_graphics_custom',
		JSON.stringify({ arLiveShadow: false, arBlob: 'yes' }),
	)
	expect(await getGraphicsCustom()).toEqual({
		...GRAPHICS_PRESETS.high,
		arLiveShadow: false,
	})

	await SecureStore.setItemAsync('zooapp_pref_graphics_custom', '{nope')
	expect(await getGraphicsCustom()).toEqual(GRAPHICS_PRESETS.high)
})
