export type TicketType = {
	id: number
	name: string
	price: number | string
	description?: string | null
}

export type Order = {
	id: number
	user_id?: number
	folio?: string | null
	status?: string | null
	subtotal?: number | string | null
	discount?: number | string | null
	total: number | string | null
	paid_at?: string | null
	created_at?: string | null
	tickets?: Ticket[]
}

export type Ticket = {
	id: number
	ticket_type_id?: number
	qr_token?: string | null
	status?: string | null
	used_at?: string | null
	ticket_type?: {
		id: number
		name: string
		price?: number | string
	}
	order?: Partial<Order>
}

// Tickets grouped by order on the "my tickets" screen.
export type Purchase = {
	orderId: number
	folio: string
	status: string
	total: number
	createdAt: string | null
	tickets: Ticket[]
}

export type TicketTypesResponse = TicketType[] | { data?: TicketType[] }

export type MyTicketsResponse = Ticket[] | { data?: Ticket[] }

export type CreateOrderBody = {
	items: {
		ticket_type_id: number
		quantity: number
	}[]
}

export type CreateOrderResponse = {
	success?: boolean
	message?: string
	data?: Order
}
