// GET /api/v1/credits: who made each card's images and 3D model, and under
// which licence. Public, the same for every user.

export type CreditAsset = 'artwork' | 'thumbnail' | 'model'

// 'origin': where the asset came from (one per asset); 'based_on': a work
// used to make it; 'component': third-party material inside it.
export type CreditRole = 'origin' | 'based_on' | 'component'

export type CreditLicense = {
	short_name: string
	name: string
	url: string | null
}

export type Credit = {
	id: number
	asset: CreditAsset
	asset_label: string
	role: CreditRole
	role_label: string
	title: string | null
	author: { name: string | null; url: string | null } | null
	source: {
		name: string | null
		label: string | null
		url: string | null
	} | null
	license: CreditLicense
	modified: boolean
	modification_note: string | null
	// Ready to show as is: the server builds it and leaves out what's missing.
	attribution: string
	based_on_asset: CreditAsset | null
}

export type CreditsSection = {
	card: { id: number; name: string; species_name: string | null }
	credits: Credit[]
}

export type CreditsResponse = {
	success: boolean
	data: CreditsSection[]
	meta: { generated_at: string; cards: number; credits: number }
}
