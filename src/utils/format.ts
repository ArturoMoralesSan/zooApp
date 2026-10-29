const currencyFormatter = new Intl.NumberFormat('es-MX', {
	style: 'currency',
	currency: 'MXN',
	minimumFractionDigits: 2,
})

// Accepts the API's numeric strings too; anything non-numeric prints $0.00.
export function formatCurrency(
	value: number | string | null | undefined,
): string {
	const amount = Number(value ?? 0)

	return currencyFormatter.format(Number.isFinite(amount) ? amount : 0)
}

type DateFormatOptions = {
	fallback?: string
	format?: Intl.DateTimeFormatOptions
}

function parseDate(date?: string | null): Date | null {
	if (!date) return null

	const parsedDate = new Date(date)

	return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

// "05 de marzo de 2026" by default.
export function formatDate(
	date?: string | null,
	{
		fallback = 'Fecha no disponible',
		format = { day: '2-digit', month: 'long', year: 'numeric' },
	}: DateFormatOptions = {},
): string {
	return parseDate(date)?.toLocaleDateString('es-MX', format) ?? fallback
}

// "09:30 a.m." by default.
export function formatTime(
	date?: string | null,
	{
		fallback = '',
		format = { hour: '2-digit', minute: '2-digit' },
	}: DateFormatOptions = {},
): string {
	return parseDate(date)?.toLocaleTimeString('es-MX', format) ?? fallback
}

// Event cards: "5 de marzo", no year.
export function formatEventDate(date: string): string {
	return formatDate(date, {
		fallback: '',
		format: { day: 'numeric', month: 'long' },
	})
}

// Event cards: "9:30 a.m.", no leading zero.
export function formatEventTime(date: string): string {
	return formatTime(date, { format: { hour: 'numeric', minute: '2-digit' } })
}
