import type { Purchase, Ticket } from '@/types/tickets'

export const getTicketStatus = (ticket?: Ticket) => {
	if (!ticket) {
		return 'Sin estado'
	}

	const status = String(ticket.status ?? '').toLowerCase()

	switch (status) {
		case 'active':
		case 'activo':
			return 'Activa'
		case 'used':
		case 'usado':
			return 'Usada'
		case 'expired':
		case 'expirado':
			return 'Expirada'
		case 'cancelled':
		case 'canceled':
		case 'cancelado':
			return 'Cancelada'
		default:
			return ticket.status ?? 'Sin estado'
	}
}

export const getTicketSummary = (purchase: Purchase) => {
	const quantities = new Map<string, number>()

	for (const ticket of purchase.tickets) {
		const name = ticket.ticket_type?.name ?? 'Entrada'

		quantities.set(name, (quantities.get(name) ?? 0) + 1)
	}

	return Array.from(quantities.entries())
		.map(([name, quantity]) => `${quantity} ${name}`)
		.join(' · ')
}

export const getActiveCount = (purchase: Purchase) => {
	return purchase.tickets.filter((ticket) => {
		const status = String(ticket.status ?? '').toLowerCase()

		return status === 'active' || status === 'activo'
	}).length
}
