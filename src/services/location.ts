import * as Location from 'expo-location'

import type { Coordinates } from './duels'

// A fix older than this may be from before the visit (e.g. at home).
const MAX_LAST_KNOWN_AGE_MS = 60_000

// The user's position for the duel's visit checks. With `ask`, location
// permission is requested if it isn't allowed yet; otherwise it's only read
// if already allowed. Requesting starts Android's permission activity even
// when it's granted, which pauses the app and ARCore (the placed animal
// jumps), so an allowed permission is never requested again.
// `fresh` skips the last known fix (a retry must not get the same one back).
// Null when there's no permission or no fix: the server answers
// location_required if it needs one.
export async function getDuelCoordinates(
	ask: boolean,
	fresh = false,
): Promise<Coordinates | null> {
	try {
		let permission = await Location.getForegroundPermissionsAsync()

		if (!permission.granted && ask && permission.canAskAgain) {
			permission = await Location.requestForegroundPermissionsAsync()
		}

		if (!permission.granted) return null

		const lastKnown = fresh
			? null
			: await Location.getLastKnownPositionAsync({
					maxAge: MAX_LAST_KNOWN_AGE_MS,
				})
		const position =
			lastKnown ??
			(await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.High,
			}))

		return {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude,
			accuracy: position.coords.accuracy,
		}
	} catch {
		return null
	}
}
