export function formatDateForApp(date: string | null | undefined): string {
	if (!date) return ''

	const parts = date.split('-')

	if (parts.length !== 3) return ''

	const [year, month, day] = parts

	return `${day}-${month}-${year}`
}

export function formatDateForApi(date: string): string | null {
	if (!date.trim()) return null

	const parts = date.split('-')

	if (parts.length !== 3) return null

	const [day, month, year] = parts

	if (day.length !== 2 || month.length !== 2 || year.length !== 4) {
		return null
	}

	return `${year}-${month}-${day}`
}

export function parseApiDate(date: string | null | undefined): Date {
	if (!date) return new Date(2000, 0, 1)

	const parts = date.split('-')

	if (parts.length !== 3) return new Date(2000, 0, 1)

	const year = Number(parts[0])
	const month = Number(parts[1])
	const day = Number(parts[2])

	if (
		!Number.isInteger(year) ||
		!Number.isInteger(month) ||
		!Number.isInteger(day)
	) {
		return new Date(2000, 0, 1)
	}

	return new Date(year, month - 1, day)
}

export function formatDateForDisplay(date: Date): string {
	const day = String(date.getDate()).padStart(2, '0')
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const year = date.getFullYear()

	return `${day}-${month}-${year}`
}
