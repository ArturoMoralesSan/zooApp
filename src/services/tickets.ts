import type {
	CreateOrderBody,
	CreateOrderResponse,
	MyTicketsResponse,
	Order,
	Ticket,
	TicketType,
	TicketTypesResponse,
} from '@/types/tickets'

import { api } from './api'

export const ticketsKeys = {
	types: '/tickets/types',
	mine: '/tickets',
	orders: '/tickets/orders',
}

export async function getTicketTypes(): Promise<TicketType[]> {
	const response = await api<TicketTypesResponse>(ticketsKeys.types)

	if (Array.isArray(response)) return response

	return Array.isArray(response?.data) ? response.data : []
}

export async function getMyTickets(): Promise<Ticket[]> {
	const response = await api<MyTicketsResponse>(ticketsKeys.mine)
	const data = Array.isArray(response) ? response : response.data

	return Array.isArray(data) ? data : []
}

// The order comes back either wrapped in `data` or bare.
export async function createOrder(body: CreateOrderBody): Promise<Order> {
	const response = await api<CreateOrderResponse | Order>(ticketsKeys.orders, {
		method: 'POST',
		body: JSON.stringify(body),
	})

	return 'data' in response && response.data
		? response.data
		: (response as Order)
}
