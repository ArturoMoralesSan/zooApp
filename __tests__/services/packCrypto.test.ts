import { describe, expect, test } from '@jest/globals'
import { File, Paths } from 'expo-file-system'

import { decrypt, sha256 } from '@/services/packCrypto'

import { makeBin } from '../../test-utils/pack'

function saveBin(bytes: Uint8Array) {
	const file = new File(Paths.document, 'packs', 'f1.bin')

	file.parentDirectory.create()
	file.write(bytes)

	return file
}

const text = (bytes: Uint8Array) => new TextDecoder().decode(bytes)

describe('decrypt', () => {
	test('opens a .bin in the server format with its key', async () => {
		const { bin, keyBase64 } = await makeBin('glTF del lobo')

		await expect(decrypt(saveBin(bin), keyBase64).then(text)).resolves.toBe(
			'glTF del lobo',
		)
	})

	// iv (12) | ciphertext | tag (16): a change anywhere must fail the tag.
	test.each([
		['iv', 0],
		['ciphertext', 12],
		['tag', -1],
	])('rejects a .bin with a changed %s byte', async (_, position) => {
		const { bin, keyBase64 } = await makeBin('glTF del lobo')
		const index = position < 0 ? bin.length + position : position

		bin[index] ^= 0xff

		await expect(decrypt(saveBin(bin), keyBase64)).rejects.toThrow()
	})

	test('rejects another card key', async () => {
		const { bin } = await makeBin('glTF del lobo')
		const other = await makeBin('otra carta')

		await expect(decrypt(saveBin(bin), other.keyBase64)).rejects.toThrow()
	})

	test('rejects a truncated .bin', async () => {
		const { bin, keyBase64 } = await makeBin('glTF del lobo')

		await expect(
			decrypt(saveBin(bin.slice(0, 20)), keyBase64),
		).rejects.toThrow()
	})
})

describe('sha256', () => {
	test('matches the hash the manifest carries', async () => {
		const { bin, sha256: expected } = await makeBin('glTF del lobo')

		await expect(sha256(saveBin(bin))).resolves.toBe(expected)
	})

	test('is lowercase hex, 64 characters', async () => {
		const hash = await sha256(saveBin(new Uint8Array([1, 2, 3])))

		expect(hash).toMatch(/^[0-9a-f]{64}$/)
	})
})
