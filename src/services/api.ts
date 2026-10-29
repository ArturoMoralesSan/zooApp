import { getToken } from './token'

const ENV_URL: string | undefined = process.env.EXPO_PUBLIC_API_URL

if (!ENV_URL) throw new Error('EXPO_PUBLIC_API_URL no está definida')

const API_URL = `${ENV_URL}/api`

export type ApiErrors = Record<string, string[]>

export class ApiValidationError extends Error {
	errors: ApiErrors
	status: number

	constructor(message: string, errors: ApiErrors, status: number) {
		super(message)
		this.name = 'ApiValidationError'
		this.errors = errors
		this.status = status
	}
}

export async function api<T>(
	endpoint: string,
	options: RequestInit = {},
): Promise<T> {
	const headers = new Headers({
		Accept: 'application/json',
		'Content-Type': 'application/json',
	})

	new Headers(options.headers).forEach((value, key) => headers.set(key, value))

	// Callers that pass their own Authorization keep it.
	if (!headers.has('Authorization')) {
		const token = await getToken()

		if (token) {
			headers.set('Authorization', `Bearer ${token}`)
		}
	}

	const response = await fetch(`${API_URL}${endpoint}`, {
		...options,
		headers,
	})

	let data: T

	try {
		data = await response.json()
	} catch {
		throw new Error(
			`La API respondió con un formato inválido. Código HTTP: ${response.status}`,
		)
	}

	if (!response.ok) {
		const errorData = data as {
			message?: string
			errors?: ApiErrors
		}

		if (response.status === 422 && errorData.errors) {
			throw new ApiValidationError(
				errorData.message || 'Revisa los datos ingresados.',
				errorData.errors,
				response.status,
			)
		}

		if (errorData.errors) {
			const firstError = Object.values(errorData.errors)[0]?.[0]

			if (firstError) {
				throw new Error(firstError)
			}
		}

		throw new Error(errorData.message || `Error de API (${response.status})`)
	}

	return data
}

export { API_URL }
