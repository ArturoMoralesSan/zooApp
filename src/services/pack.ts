import * as SecureStore from 'expo-secure-store'

import type { PackManifest, PackManifestResponse } from '@/types/pack'

import { readResponse, request } from './api'

export const packKeys = {
	manifest: '/cards/pack',
}

// null when the server answers 304: the stored catalog is still current.
export async function getPackManifest(
	etag: string | null,
): Promise<{ etag: string | null; manifest: PackManifest } | null> {
	const response = await request(packKeys.manifest, {
		headers: etag ? { 'If-None-Match': etag } : undefined,
	})

	if (response.status === 304) return null

	const body = await readResponse<PackManifestResponse>(response)

	return { etag: response.headers.get('ETag'), manifest: body.data }
}

// "Usar datos móviles para actualizar", off by default.
const CELLULAR_KEY = 'zooapp_pack_cellular'

export async function getCellularUpdates(): Promise<boolean> {
	try {
		return (await SecureStore.getItemAsync(CELLULAR_KEY)) === '1'
	} catch {
		return false
	}
}

export async function setCellularUpdates(enabled: boolean) {
	try {
		await SecureStore.setItemAsync(CELLULAR_KEY, enabled ? '1' : '0')
	} catch {
		// Not critical: the switch goes back to off next launch.
	}
}
