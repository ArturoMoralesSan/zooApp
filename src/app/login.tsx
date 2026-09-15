import { ApiValidationError } from '@/services/api'
import { login } from '@/services/auth'
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
	email?: string
	password?: string
}

export default function Login() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const [showPassword, setShowPassword] = useState(false)

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

	const handleLogin = async () => {
		setError('')
		setErrors({})

		const localErrors: FormErrors = {}

		if (!email.trim()) {
			localErrors.email = 'El correo electrónico es obligatorio.'
		}

		if (!password) {
			localErrors.password = 'La contraseña es obligatoria.'
		}

		if (Object.keys(localErrors).length > 0) {
			setErrors(localErrors)
			return
		}

		try {
			setLoading(true)

			await login({
				email: email.trim(),
				password,
			})

			router.replace('/(tabs)')
		} catch (error) {
			if (error instanceof ApiValidationError) {
				const apiErrors: FormErrors = {}

				if (error.errors.email?.[0]) {
					apiErrors.email = error.errors.email[0]
				}

				if (error.errors.password?.[0]) {
					apiErrors.password = error.errors.password[0]
				}

				setErrors(apiErrors)

				return
			}

			setError(
				error instanceof Error
					? error.message
					: 'No fue posible iniciar sesión.',
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
					paddingTop: 70,
					paddingBottom: 100,
				}}
				keyboardShouldPersistTaps='handled'
				keyboardDismissMode='on-drag'
			>
				<View className='items-center'>
					<View className='h-20 w-20 items-center justify-center rounded-3xl bg-emerald-600'>
						<Text className='text-4xl font-bold text-white'>Z</Text>
					</View>

					<Text className='mt-8 text-3xl font-bold text-gray-900'>
						¡Bienvenido a ZooApp!
					</Text>

					<Text className='mt-2 text-center text-base text-gray-500'>
						Inicia sesión para continuar tu aventura.
					</Text>
				</View>

				<View className='mt-10'>
					{/* EMAIL */}

					<Text className='mb-2 text-sm font-semibold text-gray-700'>
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
						autoCapitalize='none'
						autoCorrect={false}
						keyboardType='email-address'
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
							}}
							placeholder='Tu contraseña'
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

					{/* GENERAL ERROR */}

					{error !== '' && (
						<View className='mt-4 rounded-xl bg-red-50 px-4 py-3'>
							<Text className='text-sm text-red-600'>{error}</Text>
						</View>
					)}

					{/* FORGOT PASSWORD */}

					<Pressable
						onPress={() => router.push('/forgot-password')}
						className='mt-4 self-end'
					>
						<Text className='text-sm font-semibold text-emerald-700'>
							¿Olvidaste tu contraseña?
						</Text>
					</Pressable>

					{/* LOGIN */}

					<Pressable
						onPress={handleLogin}
						disabled={loading}
						className={`mt-6 items-center rounded-full bg-emerald-600 py-4 ${
							loading ? 'opacity-60' : ''
						}`}
					>
						{loading ? (
							<ActivityIndicator color='#ffffff' />
						) : (
							<Text className='text-base font-bold text-white'>
								Iniciar sesión
							</Text>
						)}
					</Pressable>

					{/* REGISTER */}

					<View className='mt-8 flex-row justify-center'>
						<Text className='text-base text-gray-500'>
							¿No tienes una cuenta?{' '}
						</Text>

						<Pressable onPress={() => router.push('/register')}>
							<Text className='text-base font-bold text-emerald-700'>
								Regístrate
							</Text>
						</Pressable>
					</View>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
