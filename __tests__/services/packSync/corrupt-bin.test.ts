import { expect, test } from '@jest/globals'
import { File, Paths } from 'expo-file-system'
import { http, HttpResponse } from 'msw'

import { writePackIndex, emptyPackIndex } from '@/services/packStore'
import { resolveCardAsset } from '@/services/packSync'

import { makeBin, seedPackUser } from '../../../test-utils/pack'
import { server } from '../../../test-utils/server'

// A .bin that no longer opens (wrong tag) must not keep the card broken:
// it's dropped so the next sync downloads it again, and the asset comes from
// its URL meanwhile.
test('a corrupt .bin is deleted and the card falls back to its URL', async () => {
	const { bin, keyBase64 } = await makeBin('decrypted model')
	const user = await seedPackUser(7)
	const packed = new File(Paths.document, 'packs', 'v1.bin')

	bin[bin.length - 1] ^= 0xff
	writePackIndex({
		...emptyPackIndex(),
		files: { v1: { card_id: 1, kind: 'model', bytes: bin.length } },
	})
	packed.write(bin)

	server.use(
		http.get('http://cdn.test/models/1.glb', () =>
			HttpResponse.text('model from the URL'),
		),
	)

	const asset = await resolveCardAsset({
		cardId: 1,
		kind: 'model',
		ref: { id: 'v1', key: keyBase64 },
		url: 'http://cdn.test/models/1.glb',
	})

	expect(packed.exists).toBe(false)

	const index = JSON.parse(
		await new File(Paths.document, 'packs', 'index.json').text(),
	)

	expect(index.files).toEqual({})

	// Downloaded once and kept as the card's copy for next time.
	const copy = new File(user, '1-model-v1.glb')

	expect(asset).toEqual({ uri: copy.uri, source: 'remote' })
	await expect(copy.text()).resolves.toBe('model from the URL')
})
