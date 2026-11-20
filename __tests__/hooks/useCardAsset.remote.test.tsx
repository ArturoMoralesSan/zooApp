import { expect, test } from '@jest/globals'
import { renderHook, waitFor } from '@testing-library/react-native'
import { File } from 'expo-file-system'
import { http, HttpResponse } from 'msw'

import { useCardAsset } from '@/hooks/useCardAsset'
import { loadState } from '@/services/packSync'

import { seedPackUser } from '../../test-utils/pack'
import { server } from '../../test-utils/server'

// Not in the pack and no copy: the file is downloaded from its URL once and
// kept, instead of fetching it on every visit.
test('without the pack, the file is downloaded once and kept as the copy', async () => {
	const user = await seedPackUser(7)
	let downloads = 0

	server.use(
		http.get('http://cdn.test/1', () => {
			downloads++

			return HttpResponse.text('model from the URL')
		}),
	)
	await loadState()

	const renders: ReturnType<typeof useCardAsset>[] = []
	const { result } = await renderHook(() => {
		const asset = useCardAsset(
			1,
			'model',
			{ id: 'v1', key: 'key' },
			'http://cdn.test/1',
		)

		renders.push(asset)

		return asset
	})

	expect(renders[0]).toMatchObject({ loading: true, downloading: true })

	const copy = new File(user, '1-model-v1.glb')

	await waitFor(() =>
		expect(result.current).toMatchObject({
			uri: copy.uri,
			source: 'remote',
			loading: false,
		}),
	)
	await expect(copy.text()).resolves.toBe('model from the URL')

	// Shown again (another screen): the kept copy, no second download.
	const again = await renderHook(() =>
		useCardAsset(1, 'model', { id: 'v1', key: 'key' }, 'http://cdn.test/1'),
	)

	expect(again.result.current).toMatchObject({ source: 'local' })
	expect(downloads).toBe(1)

	// A card without that file and without a URL has nothing to show.
	const none = await renderHook(() => useCardAsset(2, 'card_image', null, null))

	await waitFor(() =>
		expect(none.result.current).toEqual({
			uri: null,
			source: 'none',
			loading: false,
			downloading: false,
		}),
	)
})
