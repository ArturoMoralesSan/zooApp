import { expect, test } from '@jest/globals'
import { renderHook, waitFor } from '@testing-library/react-native'
import { File, Paths } from 'expo-file-system'

import { useCardAsset } from '@/hooks/useCardAsset'
import { emptyPackIndex, writePackIndex } from '@/services/packStore'
import { loadState } from '@/services/packSync'

import { makeBin, seedPackUser } from '../../test-utils/pack'

// The card's file is in the downloaded pack but not decrypted yet: it's
// decrypted once, on the phone, without the network.
test('a file in the pack is decrypted into a copy, not downloaded', async () => {
	const user = await seedPackUser(7)
	const { bin, keyBase64 } = await makeBin('decrypted model')

	writePackIndex({
		...emptyPackIndex(),
		files: { v1: { card_id: 1, kind: 'model', bytes: bin.length } },
	})
	new File(Paths.document, 'packs', 'v1.bin').write(bin)
	await loadState()

	const renders: ReturnType<typeof useCardAsset>[] = []
	const { result } = await renderHook(() => {
		const asset = useCardAsset(
			1,
			'model',
			{ id: 'v1', key: keyBase64 },
			'http://cdn.test/1',
		)

		renders.push(asset)

		return asset
	})

	// Loading, but from the phone: no "downloading" state.
	expect(renders[0]).toMatchObject({ loading: true, downloading: false })

	const copy = new File(user, '1-model-v1.glb')

	await waitFor(() =>
		expect(result.current).toEqual({
			uri: copy.uri,
			source: 'pack',
			loading: false,
			downloading: false,
		}),
	)
	await expect(copy.text()).resolves.toBe('decrypted model')
})
