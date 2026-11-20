import { expect, test } from '@jest/globals'
import { renderHook, waitFor } from '@testing-library/react-native'
import { File } from 'expo-file-system'

import { useCardAsset } from '@/hooks/useCardAsset'
import { writeUserIndex } from '@/services/packStore'
import { loadState } from '@/services/packSync'

import { seedPackUser } from '../../test-utils/pack'

// The first render already has the file when its current version is on the
// phone, so the 3D view doesn't flash a loading state.
test('a current decrypted copy is used right away', async () => {
	const user = await seedPackUser(7)
	const copy = new File(user, '1-model-v1.glb')

	copy.write('decrypted model')
	writeUserIndex(7, {
		'1-model': { id: 'v1', name: '1-model-v1.glb', bytes: 15 },
	})
	await loadState()

	const { result } = await renderHook(() =>
		useCardAsset(1, 'model', { id: 'v1', key: 'key' }, 'http://cdn.test/1'),
	)

	expect(result.current).toEqual({
		uri: copy.uri,
		source: 'local',
		loading: false,
		downloading: false,
	})
	await waitFor(() => expect(result.current.source).toBe('local'))
})
