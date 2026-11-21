import { describe, expect, jest, test } from '@jest/globals'
import { Directory, File, Paths } from 'expo-file-system'

import {
	assetKey,
	copyName,
	deleteFile,
	emptyPackIndex,
	readPackIndex,
	readStoredCards,
	readUserIndex,
	wipeOtherUsers,
	wipePacks,
	wipeUser,
	writePackIndex,
	writeStoredCards,
	writeUserIndex,
} from '@/services/packStore'

import { __fs } from '../../jest/mocks/file-system'
import { makeOwnedCard } from '../../test-utils/factories'

const packs = () => new Directory(Paths.document, 'packs')
const userDir = (id: number) => new Directory(Paths.document, 'cards', `${id}`)

function write(file: File, content: string) {
	file.parentDirectory.create()
	file.write(content)
}

describe('names', () => {
	test('assetKey identifies a card file by card and kind', () => {
		expect(assetKey(12, 'card_image')).toBe('12-card_image')
	})

	test('copyName keeps the version and uses the file type of the kind', () => {
		expect(copyName(12, 'model', 'v3')).toBe('12-model-v3.glb')
		expect(copyName(12, 'card_image', 'v3')).toBe('12-card_image-v3.webp')
		expect(copyName(12, 'thumbnail', 'v3')).toBe('12-thumbnail-v3.webp')
	})
})

describe('pack index', () => {
	test('starts empty and disabled when nothing was saved', async () => {
		await expect(readPackIndex()).resolves.toEqual(emptyPackIndex())
		expect(emptyPackIndex()).toMatchObject({ enabled: false, files: {} })
	})

	test('a corrupt index reads as empty instead of failing', async () => {
		write(new File(packs(), 'index.json'), '{not json')

		await expect(readPackIndex()).resolves.toEqual(emptyPackIndex())
	})

	test('an older index gets the fields it lacks', async () => {
		write(new File(packs(), 'index.json'), JSON.stringify({ enabled: true }))

		await expect(readPackIndex()).resolves.toEqual({
			...emptyPackIndex(),
			enabled: true,
		})
	})

	test('is written through a temp file that never stays behind', async () => {
		const index = {
			...emptyPackIndex(),
			etag: '"m1"',
			files: { f1: { card_id: 1, kind: 'model' as const, bytes: 10 } },
		}

		writePackIndex(index)

		await expect(readPackIndex()).resolves.toEqual(index)
		expect(
			packs()
				.list()
				.map((item) => item.name),
		).toEqual(['index.json'])
	})
})

describe('user files', () => {
	test('the index of decrypted copies round-trips per user', async () => {
		const index = { '1-model': { id: 'v1', name: '1-model-v1.glb', bytes: 3 } }

		writeUserIndex(7, index)

		await expect(readUserIndex(7)).resolves.toEqual(index)
		await expect(readUserIndex(8)).resolves.toEqual({})
	})

	test('the saved card list round-trips per user', async () => {
		const stored = { etag: '"c1"', cards: [makeOwnedCard()] }

		writeStoredCards(7, stored)

		await expect(readStoredCards(7)).resolves.toEqual(stored)
		await expect(readStoredCards(8)).resolves.toBeNull()
	})
})

describe('wiping', () => {
	test("wipeUser deletes that user's decrypted copies and nobody else's", () => {
		write(new File(userDir(7), '1-model-v1.glb'), 'plain model')
		write(new File(userDir(8), '2-model-v1.glb'), 'plain model')
		write(new File(packs(), 'v1.bin'), 'encrypted')

		wipeUser(7)

		expect(userDir(7).exists).toBe(false)
		expect(
			[...__fs.files.keys()].some((uri) => uri.includes('/cards/7/')),
		).toBe(false)
		expect(new File(userDir(8), '2-model-v1.glb').exists).toBe(true)
		expect(new File(packs(), 'v1.bin').exists).toBe(true)
	})

	test('wipeUser of a user without copies does nothing', () => {
		expect(() => wipeUser(9)).not.toThrow()
	})

	test('wipeOtherUsers keeps the account signing in and deletes the rest', () => {
		write(new File(userDir(7), '1-model-v1.glb'), 'plain model')
		write(new File(userDir(8), '2-model-v1.glb'), 'plain model')
		write(new File(userDir(9), '3-model-v1.glb'), 'plain model')
		write(new File(packs(), 'v1.bin'), 'encrypted')
		// One account's folder is locked: the others still go.
		jest.spyOn(Directory.prototype, 'delete').mockImplementationOnce(() => {
			throw new Error('Directory is in use')
		})

		wipeOtherUsers(8)

		expect([userDir(7), userDir(9)].filter((dir) => dir.exists)).toHaveLength(1)
		expect(new File(userDir(8), '2-model-v1.glb').exists).toBe(true)
		expect(new File(packs(), 'v1.bin').exists).toBe(true)

		wipeOtherUsers(8)

		expect(userDir(7).exists).toBe(false)
		expect(userDir(9).exists).toBe(false)
	})

	test('wipeOtherUsers without any copies does nothing', () => {
		expect(() => wipeOtherUsers(8)).not.toThrow()
	})

	test('wipePacks deletes the encrypted files and keeps the copies', () => {
		write(new File(packs(), 'v1.bin'), 'encrypted')
		write(new File(userDir(7), '1-model-v1.glb'), 'plain model')

		wipePacks()

		expect(packs().exists).toBe(false)
		expect(new File(userDir(7), '1-model-v1.glb').exists).toBe(true)
	})

	test('deleteFile ignores a file that is already gone', () => {
		expect(() => deleteFile(new File(packs(), 'missing.bin'))).not.toThrow()
	})
})
