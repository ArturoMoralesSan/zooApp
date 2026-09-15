import { ApiValidationError } from '@/services/api'
import { register } from '@/services/auth'
import { router } from 'expo-router'
import { useState } from 'react'
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from 'react-native'

type FormErrors = {
	name?: string
	email?: string
	password?: string
	password_confirmation?: string
}

export default function Register() {
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [passwordConfirmation, setPasswordConfirmation] = useState('')

	const [showPassword, setShowPassword] = useState(false)
	const [showPasswordConfirmation, setShowPasswordConfirmation] =
		useState(false)

	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [errors, setErrors] = useState<FormErrors>({})

	const clearFieldError = (field: keyof FormErrors) => {
		setErrors((current) => ({
			...current,
			[field]: undefined,
		}))

		setError('')
	}

	const handleRegister = async () => {
		setError('')
		setErrors({})

		const localErrors: FormErrors = {}

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

		if (Object.keys(localErrors).length > 0) {
			setErrors(localErrors)
			return
		}

		try {
			setLoading(true)

			await register({
				name: name.trim(),
				email: email.trim(),
				password,
				password_confirmation: passwordConfirmation,
			})

			router.replace('/(tabs)')
		} catch (error) {
			if (error instanceof ApiValidationError) {
				const apiErrors: FormErrors = {}

				if (error.errors.name?.[0]) {
					apiErrors.name = error.errors.name[0]
				}

				if (error.errors.email?.[0]) {
					apiErrors.email = error.errors.email[0]
				}

				if (error.errors.password?.[0]) {
					apiErrors.password = error.errors.password[0]
				}

				if (error.errors.password_confirmation?.[0]) {
					apiErrors.password_confirmation =
						error.errors.password_confirmation[0]
				}

				setErrors(apiErrors)

				return
			}

			setError(
				error instanceof Error
					? error.message
					: 'No fue posible crear la cuenta.',
			)
		} finally {
			setLoading(false)
		}
	}

	return (
		<KeyboardAvoidingView
			className='flex-1 bg-gray-50'
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
		>
			<ScrollView
				className='flex-1'
				contentContainerStyle={{
					paddingHorizontal: 24,
					paddingTop: 50,
					paddingBottom: 120,
				}}
				keyboardShouldPersistTaps='handled'
				keyboardDismissMode='on-drag'
			>
				<Pressable onPress={() => router.back()} className='mb-8'>
					<Text className='text-base font-semibold text-emerald-700'>
						‹ Volver
					</Text>
				</Pressable>

				<View className='items-center'>
					<View className='h-20 w-20 items-center justify-center rounded-3xl bg-emerald-600'>
						<Text className='text-4xl font-bold text-white'>Z</Text>
					</View>

					<Text className='mt-8 text-3xl font-bold text-gray-900'>
						Crea tu cuenta
					</Text>

					<Text className='mt-2 text-center text-base text-gray-500'>
						Únete a ZooApp y comienza a descubrir el zoológico.
					</Text>
				</View>

				<View className='mt-8'>
					{/* NOMBRE */}

					<Text className='mb-2 text-sm font-semibold text-gray-700'>
						Nombre completo
					</Text>

					<TextInput
						value={name}
						onChangeText={(value) => {
							setName(value)
							clearFieldError('name')
						}}
						placeholder='Tu nombre'
						placeholderTextColor='#9ca3af'
						autoCapitalize='words'
						className={`rounded-xl border bg-white px-4 py-4 text-base text-gray-900 ${
							errors.name ? 'border-red-500' : 'border-gray-200'
						}`}
					/>

					{errors.name && (
						<Text className='mt-1 text-sm text-red-600'>{errors.name}</Text>
					)}

					{/* EMAIL */}

					<Text className='mb-2 mt-5 text-sm font-semibold text-gray-700'>
						Correo electrónico
					</Text>

					<TextInput
						value={email}
						onChangeText={(value) => {
							setEmail(value)
							clearFieldError('email')
						}}
						placeholder='correo@ejemplo.com'
						placeholderTextColor='#9ca3af'
						keyboardType='email-address'
						autoCapitalize='none'
						autoCorrect={false}
						className={`rounded-xl border bg-white px-4 py-4 text-base text-gray-900 ${
							errors.email ? 'border-red-500' : 'border-gray-200'
						}`}
					/>

					{errors.email && (
						<Text className='mt-1 text-sm text-red-600'>{errors.email}</Text>
					)}

					{/* PASSWORD */}

					<Text className='mb-2 mt-5 text-sm font-semibold text-gray-700'>
						Contraseña
					</Text>

					<View className='relative'>
						<TextInput
							value={password}
							onChangeText={(value) => {
								setPassword(value)
								clearFieldError('password')
								clearFieldError('password_confirmation')
							}}
							placeholder='Mínimo 8 caracteres'
							placeholderTextColor='#9ca3af'
							secureTextEntry={!showPassword}
							autoCapitalize='none'
							className={`rounded-xl border bg-white px-4 py-4 pr-24 text-base text-gray-900 ${
								errors.password ? 'border-red-500' : 'border-gray-200'
							}`}
						/>

						<Pressable
							onPress={() => setShowPassword(!showPassword)}
							className='absolute right-2 top-2 rounded-full bg-gray-100 px-4 py-2.5'
						>
							<Text className='text-sm font-semibold text-gray-600'>
								{showPassword ? 'Ocultar' : 'Ver'}
							</Text>
						</Pressable>
					</View>

					{errors.password && (
						<Text className='mt-1 text-sm text-red-600'>{errors.password}</Text>
					)}

					{/* CONFIRM PASSWORD */}

					<Text className='mb-2 mt-5 text-sm font-semibold text-gray-700'>
						Confirmar contraseña
					</Text>

					<View className='relative'>
						<TextInput
							value={passwordConfirmation}
							onChangeText={(value) => {
								setPasswordConfirmation(value)
								clearFieldError('password_confirmation')
							}}
							placeholder='Repite tu contraseña'
							placeholderTextColor='#9ca3af'
							secureTextEntry={!showPasswordConfirmation}
							autoCapitalize='none'
							className={`rounded-xl border bg-white px-4 py-4 pr-24 text-base text-gray-900 ${
								errors.password_confirmation
									? 'border-red-500'
									: 'border-gray-200'
							}`}
						/>

						<Pressable
							onPress={() =>
								setShowPasswordConfirmation(!showPasswordConfirmation)
							}
							className='absolute right-2 top-2 rounded-full bg-gray-100 px-4 py-2.5'
						>
							<Text className='text-sm font-semibold text-gray-600'>
								{showPasswordConfirmation ? 'Ocultar' : 'Ver'}
							</Text>
						</Pressable>
					</View>

					{errors.password_confirmation && (
						<Text className='mt-1 text-sm text-red-600'>
							{errors.password_confirmation}
						</Text>
					)}

					{/* ERROR GENERAL */}

					{error !== '' && (
						<View className='mt-4 rounded-xl bg-red-50 px-4 py-3'>
							<Text className='text-sm text-red-600'>{error}</Text>
						</View>
					)}

					{/* BUTTON */}

					<Pressable
						onPress={handleRegister}
						disabled={loading}
						className={`mt-6 items-center rounded-full bg-emerald-600 py-4 ${
							loading ? 'opacity-60' : ''
						}`}
					>
						{loading ? (
							<ActivityIndicator color='#ffffff' />
						) : (
							<Text className='text-base font-bold text-white'>
								Crear cuenta
							</Text>
						)}
					</Pressable>

					<View className='mt-8 flex-row justify-center'>
						<Text className='text-base text-gray-500'>
							¿Ya tienes una cuenta?{' '}
						</Text>

						<Pressable onPress={() => router.replace('/login')}>
							<Text className='text-base font-bold text-emerald-700'>
								Inicia sesión
							</Text>
						</Pressable>
					</View>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
