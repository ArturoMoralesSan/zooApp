export type ExploreZone = {
	id: number
	name: string
}

export type ExploreEvent = {
	id: number
	name: string
	slug: string
	description: string | null
	type: string | null
	start_at: string
	end_at: string | null
	image: string | null
	capacity: number | null
	zone: ExploreZone | null
}

export type ExploreResponse = {
	success: boolean
	data: {
		featured_events: ExploreEvent[]
	}
}
