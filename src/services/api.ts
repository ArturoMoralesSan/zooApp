import { getToken } from './token'

const ENV_URL: string | undefined = process.env.EXPO_PUBLIC_API_URL

if (!ENV_URL) throw new Error('EXPO_PUBLIC_API_URL no está definida')

const API_URL = `${ENV_URL}/api`

export type ApiErrors = Record<string, string[]>

// An error response from the server. `data` is the envelope's `data`, when
// the endpoint sends one with the error (e.g. the locked duel's attempts).
export class ApiError extends Error {
	status: number
	data: unknown

	constructor(message: string, status: number, data?: unknown) {
		super(message)
		this.name = 'ApiError'
		this.status = status
		this.data = data
	}
}

export class ApiValidationError extends ApiError {
	errors: ApiErrors

	constructor(message: string, errors: ApiErrors, status: number) {
		super(message, status)
		this.name = 'ApiValidationError'
		this.errors = errors
	}
}

// fetch() rejects with a TypeError when the request never reaches the
// server (no network, DNS, timeout); api() rethrows it as NetworkError.
export class NetworkError extends Error {
	constructor() {
		super('Sin conexión')
		this.name = 'NetworkError'
	}
}

// Tells a failed connection apart from an error the server answered with.
export function isNetworkError(error: unknown) {
	return error instanceof NetworkError || error instanceof TypeError
}

// Sends a request with the JSON headers and the session token, and returns
// the raw response. Most callers want api(); this is for the ones that read
// headers or statuses without a body (ETag / 304).
export async function request(
	endpoint: string,
	options: RequestInit = {},
): Promise<Response> {
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

	try {
		return await fetch(`${API_URL}${endpoint}`, {
			...options,
			headers,
		})
	} catch {
		throw new NetworkError()
	}
}

export async function api<T>(
	endpoint: string,
	options: RequestInit = {},
): Promise<T> {
	return readResponse<T>(await request(endpoint, options))
}

// Parses a JSON response, throwing ApiError/ApiValidationError when it failed.
export async function readResponse<T>(response: Response): Promise<T> {
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
			data?: unknown
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
				throw new ApiError(firstError, response.status, errorData.data)
			}
		}

		throw new ApiError(
			errorData.message || `Error de API (${response.status})`,
			response.status,
			errorData.data,
		)
	}

	return data
}

export { API_URL }
