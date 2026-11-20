import { expect, test } from '@jest/globals'
import { File, Paths } from 'expo-file-system'
import { http, HttpResponse } from 'msw'

import { getPackStatus, syncPack } from '@/services/packSync'

import {
	makePackedCard,
	seedPackUser,
	serveCards,
	serveFiles,
} from '../../../test-utils/pack'
import { API, server } from '../../../test-utils/server'

// A file that doesn't match the catalog's hash was probably replaced while
// downloading: the catalog is read again (ignoring the ETag) and the file
// retried once; if it still doesn't match, it's marked as failed.
test('a file with the wrong hash is retried once with a fresh catalog, then fails', async () => {
	await seedPackUser(7)

	const card = await makePackedCard(1)
	const manifestEtags: (string | null)[] = []
	const files = serveFiles({ [card.file.url]: card.bin })

	server.use(
		http.get(`${API}/cards/pack`, ({ request }) => {
			manifestEtags.push(request.headers.get('If-None-Match'))

			return HttpResponse.json(
				{
					success: true,
					data: {
						generated_at: '2026-11-19T00:00:00Z',
						total_bytes: card.file.bytes,
						files: [{ ...card.file, sha256: 'not-the-real-hash' }],
					},
				},
				{ headers: { ETag: '"manifest-1"' } },
			)
		}),
		serveCards([card.card]),
		files.handler,
	)

	await expect(syncPack({ userTriggered: true })).resolves.toEqual({
		kind: 'downloaded',
		count: 0,
		failed: 1,
	})

	expect(files.downloaded).toEqual([card.file.url, card.file.url])
	expect(manifestEtags).toEqual([null, null])
	expect(new File(Paths.document, 'packs', `${card.file.id}.bin`).exists).toBe(
		false,
	)
	expect(getPackStatus()).toMatchObject({ failedCount: 1, doneCount: 0 })
	expect(getPackStatus().files[0].state).toBe('error')
})
