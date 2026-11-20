import { expect, test } from '@jest/globals'
import { renderHook, waitFor } from '@testing-library/react-native'
import { File } from 'expo-file-system'

import { useCardAsset } from '@/hooks/useCardAsset'
import { writeUserIndex } from '@/services/packStore'
import { loadState } from '@/services/packSync'

import { __setNetState, OFFLINE } from '../../jest/mocks/netinfo'
import { seedPackUser } from '../../test-utils/pack'

// A newer version exists but can't be fetched now (offline, or mobile data
// without permission): the old copy is better than nothing.
test('offline, an older copy is shown instead of the newer version', async () => {
	const user = await seedPackUser(7)
	const old = new File(user, '1-model-v1.glb')

	old.write('old model')
	writeUserIndex(7, {
		'1-model': { id: 'v1', name: '1-model-v1.glb', bytes: 9 },
	})
	__setNetState(OFFLINE)
	await loadState()

	const renders: ReturnType<typeof useCardAsset>[] = []
	const { result } = await renderHook(() => {
		const asset = useCardAsset(
			1,
			'model',
			{ id: 'v2', key: 'key' },
			'http://cdn.test/1',
		)

		renders.push(asset)

		return asset
	})

	// v2 isn't on the phone: the first render expects it from the network.
	expect(renders[0]).toMatchObject({ loading: true, downloading: true })

	await waitFor(() =>
		expect(result.current).toMatchObject({
			uri: old.uri,
			source: 'stale',
			loading: false,
		}),
	)
})
