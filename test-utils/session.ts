import { Directory, File, Paths } from 'expo-file-system'
import * as SecureStore from 'expo-secure-store'
import { http, HttpResponse } from 'msw'

import type { User } from '@/types/user'

import { makeUser } from './factories'
import { seedPackUser } from './pack'
import { API } from './server'

// A user signed in on this phone with the offline pack in use: session
// token, one decrypted card and the shared encrypted .bin it came from.
export async function seedSignedInUser(user: User = makeUser()) {
	await SecureStore.setItemAsync('zooapp_token', 'token-de-prueba')

	const cards = await seedPackUser(user.id)
	const copy = new File(cards, '1-model-v1.glb')
	const packs = new Directory(Paths.document, 'packs')
	const bin = new File(packs, 'v1.bin')

	copy.write('decrypted model')
	packs.create()
	bin.write('encrypted model')

	return { user, cards, copy, bin }
}

export function serveCurrentUser(user: User) {
	return http.get(`${API}/user`, () =>
		HttpResponse.json({ success: true, user }),
	)
}
