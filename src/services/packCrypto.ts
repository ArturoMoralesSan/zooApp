import {
	AESEncryptionKey,
	AESSealedData,
	CryptoDigestAlgorithm,
	aesDecryptAsync,
	digest,
} from 'expo-crypto'
import type { File } from 'expo-file-system'

// The server's .bin format: iv (12 bytes) | ciphertext | GCM tag (16 bytes),
// i.e. expo-crypto's "combined" layout.
const SEALED = { ivLength: 12, tagLength: 16 } as const

// Throws when the tag doesn't match (wrong key or a corrupt .bin).
export async function decrypt(bin: File, keyBase64: string) {
	const sealed = AESSealedData.fromCombined(await bin.bytes(), SEALED)
	const key = await AESEncryptionKey.import(keyBase64, 'base64')

	return aesDecryptAsync(sealed, key, { output: 'bytes' })
}

export async function sha256(file: File) {
	const hash = new Uint8Array(
		await digest(CryptoDigestAlgorithm.SHA256, await file.bytes()),
	)

	return Array.from(hash, (byte) => byte.toString(16).padStart(2, '0')).join('')
}
