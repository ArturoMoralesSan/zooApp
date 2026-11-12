import { useEffect, useState, useSyncExternalStore } from 'react'

import {
	type AssetSource,
	getPackVersion,
	isOnDevice,
	peekCardAsset,
	resolveCardAsset,
	subscribePack,
} from '@/services/packSync'
import type { CardPack, PackKind, PackRef } from '@/types/pack'

export type CardAssetResult = {
	uri: string | null
	source: AssetSource
	loading: boolean
	// Loading from the network, not from the phone.
	downloading: boolean
}

// Where a card's file comes from: the offline pack, a local copy or its URL.
// Screens use this instead of reading `*_url` directly. `cardId` is missing
// for the duel's card; the catalog resolves it from the file id.
export function useCardAsset(
	cardId: number | undefined,
	kind: PackKind,
	ref: PackRef | null | undefined,
	url: string | null,
): CardAssetResult {
	// Only the copies' version: progress updates mustn't re-render (and
	// re-resolve) every screen showing a card, AR scenes included.
	const version = useSyncExternalStore(subscribePack, getPackVersion)
	const refId = ref?.id
	const refKey = ref?.key

	const [result, setResult] = useState<Omit<CardAssetResult, 'downloading'>>(
		() => {
			const uri = peekCardAsset({ cardId, kind, ref, url })

			return uri
				? { uri, source: 'local', loading: false }
				: { uri: null, source: 'none', loading: true }
		},
	)

	useEffect(() => {
		let active = true
		const request = {
			cardId,
			kind,
			ref:
				refId !== undefined && refKey !== undefined
					? { id: refId, key: refKey }
					: ref === null
						? null
						: undefined,
			url,
		}

		resolveCardAsset(request)
			.catch(() => ({ uri: url, source: url ? 'remote' : 'none' }) as const)
			.then((asset) => {
				if (active) setResult({ ...asset, loading: false })
			})

		return () => {
			active = false
		}
		// `ref` is read through its id/key so a new object with the same file
		// doesn't resolve again; `version` re-resolves when copies change.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cardId, kind, refId, refKey, ref === null, url, version])

	return {
		...result,
		downloading: result.loading && url !== null && !isOnDevice(ref),
	}
}

type CardFaceSource = {
	id?: number
	card_image_url?: string | null
	thumbnail_image: string | null
	pack?: CardPack
}

// The card's final image, or its thumbnail when it has none (carousel, 3D
// view, duel result).
export function useCardFace(card: CardFaceSource | null | undefined) {
	const hasImage = Boolean(card?.card_image_url || card?.pack?.card_image)
	const image = useCardAsset(
		card?.id,
		'card_image',
		card?.pack?.card_image,
		card?.card_image_url ?? null,
	)
	const thumbnail = useCardAsset(
		card?.id,
		'thumbnail',
		hasImage ? undefined : card?.pack?.thumbnail,
		hasImage ? null : (card?.thumbnail_image ?? null),
	)

	return hasImage ? image : thumbnail
}
