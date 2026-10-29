export type PaymentMethod = {
	id?: number
	name?: string | null
	code?: string | null
}

export type Donation = {
	id: number | string
	amount?: number | string | null
	status?: string | null
	reference?: string | null
	created_at?: string | null
	payment_method?: PaymentMethod | null
}

// The API has returned the list bare, under `data`, under `donations`, and
// nested one level deeper; the history screen accepts all of them.
type DonationList = {
	data?: Donation[]
	donations?: Donation[]
}

export type DonationsResponse =
	Donation[] | (DonationList & { data?: Donation[] | DonationList })

export type CreateDonationResponse = {
	success?: boolean
	message?: string
	data?: {
		donation?: Donation
	}
	donation?: Donation
}
