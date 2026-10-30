import type { RegisterFormErrors } from '@/types/auth'

export function validateRegisterForm({
	name,
	email,
	password,
	passwordConfirmation,
}: {
	name: string
	email: string
	password: string
	passwordConfirmation: string
}): RegisterFormErrors {
	const localErrors: RegisterFormErrors = {}

	if (!name.trim()) {
		localErrors.name = 'El nombre es obligatorio.'
	}

	if (!email.trim()) {
		localErrors.email = 'El correo electrónico es obligatorio.'
	}

	if (!password) {
		localErrors.password = 'La contraseña es obligatoria.'
	} else if (password.length < 8) {
		localErrors.password = 'La contraseña debe tener al menos 8 caracteres.'
	}

	if (!passwordConfirmation) {
		localErrors.password_confirmation = 'Confirma tu contraseña.'
	} else if (password !== passwordConfirmation) {
		localErrors.password_confirmation = 'Las contraseñas no coinciden.'
	}

	return localErrors
}
