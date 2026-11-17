import * as Location from 'expo-location'

import type { Coordinates } from './duels'

// A fix older than this may be from before the visit (e.g. at home).
const MAX_LAST_KNOWN_AGE_MS = 60_000

// The user's position for the duel's visit checks. With `ask`, location
// permission is requested; otherwise it's only read if already allowed.
// Null when there's no permission or no fix: the server answers
// location_required if it needs one.
export async function getDuelCoordinates(
	ask: boolean,
): Promise<Coordinates | null> {
	try {
		const permission = ask
			? await Location.requestForegroundPermissionsAsync()
			: await Location.getForegroundPermissionsAsync()

		if (!permission.granted) return null

		const position =
			(await Location.getLastKnownPositionAsync({
				maxAge: MAX_LAST_KNOWN_AGE_MS,
			})) ??
			(await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.High,
			}))

		return {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude,
		}
	} catch {
		return null
	}
}
