import { describe, expect, jest, test } from '@jest/globals'
import NetInfo from '@react-native-community/netinfo'
import { fireEvent, screen } from '@testing-library/react-native'
import { File, Paths } from 'expo-file-system'
import * as SecureStore from 'expo-secure-store'
import { http, HttpResponse } from 'msw'
import { createElement } from 'react'

import { DuelAnswer } from '@/components/duel/DuelAnswer'
import { api } from '@/services/api'
import { decrypt } from '@/services/packCrypto'

import { __setNetState, CELLULAR } from '../../jest/mocks/netinfo'
import { makeBin } from '../../test-utils/pack'
import { renderWithProviders } from '../../test-utils/render'
import { API, server } from '../../test-utils/server'

// Phase 0: every ZooDeck module loads under Jest, and the test doubles behave
// like the native modules they replace.
describe('ZooDeck modules import', () => {
	test.each([
		'@/services/packCrypto',
		'@/services/packStore',
		'@/services/packSync',
		'@/services/cards',
		'@/services/duels',
		'@/services/pack',
		'@/contexts/DuelContext',
		'@/utils/zoodeckDebug',
		'@/utils/offlinePack',
	])('%s', (path) => {
		// The module itself, unmocked; its native dependencies stay mocked.
		expect(jest.requireActual(path)).toBeDefined()
	})
})

describe('test environment', () => {
	test('SecureStore reads missing keys as null', async () => {
		await expect(SecureStore.getItemAsync('missing')).resolves.toBeNull()

		await SecureStore.setItemAsync('key', 'value')

		await expect(SecureStore.getItemAsync('key')).resolves.toBe('value')
	})

	test('NetInfo starts on Wi-Fi and can switch', async () => {
		await expect(NetInfo.fetch()).resolves.toMatchObject({ type: 'wifi' })

		__setNetState(CELLULAR)

		await expect(NetInfo.fetch()).resolves.toMatchObject({
			type: 'cellular',
		})
	})

	test('the file system keeps what is written', async () => {
		const file = new File(Paths.document, 'packs', 'index.json')

		file.parentDirectory.create()
		file.write('{}')

		expect(file.exists).toBe(true)
		await expect(file.text()).resolves.toBe('{}')
	})

	test('state does not leak from the previous test', () => {
		expect(new File(Paths.document, 'packs', 'index.json').exists).toBe(false)
	})

	test('expo-crypto decrypts a server .bin', async () => {
		const { bin, keyBase64 } = await makeBin('modelo')
		const file = new File(Paths.document, 'packs', 'f1.bin')

		file.parentDirectory.create()
		file.write(bin)

		const plain = await decrypt(file, keyBase64)

		expect(new TextDecoder().decode(plain)).toBe('modelo')
	})

	test('MSW answers api() requests', async () => {
		server.use(http.get(`${API}/ping`, () => HttpResponse.json({ ok: true })))

		await expect(api('/ping')).resolves.toEqual({ ok: true })
	})

	test('components render with NativeWind and Hugeicons', async () => {
		const onPress = jest.fn()

		await renderWithProviders(
			createElement(DuelAnswer, { label: 'Carne', state: 'selected', onPress }),
		)
		await fireEvent.press(
			screen.getByRole('radio', { name: 'Carne', checked: true }),
		)

		expect(onPress).toHaveBeenCalledTimes(1)
	})

	test('dates use the zoo time zone', () => {
		expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(
			'America/Monterrey',
		)
	})
})
