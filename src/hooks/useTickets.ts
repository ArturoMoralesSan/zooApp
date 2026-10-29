import { getMyTickets, getTicketTypes, ticketsKeys } from '@/services/tickets'

import { useQuery } from './useQuery'

export function useTicketTypes() {
	return useQuery(ticketsKeys.types, getTicketTypes)
}

export function useMyTickets() {
	return useQuery(ticketsKeys.mine, getMyTickets)
}
