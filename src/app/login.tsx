import { AuthCard } from '@/components/auth/AuthCard'
import { AuthSwitchLink } from '@/components/auth/AuthSwitchLink'
import { Button } from '@/components/ui/Button'
import { Notice } from '@/components/ui/Notice'
import { TextLink } from '@/components/ui/TextLink'
import { useScrollBottomSpace } from '@/theme/layout'
import { useAuth } from '@/contexts/AuthContext'
import { ApiValidationError } from '@/services/api'
import { PasswordField } from '@/components/ui/PasswordField'
import { TextField } from '@/components/ui/TextField'
import { router } from 'expo-router'
import { useState } from 'react'
import {
	Image,
	ImageBackground,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	View,
} from 'react-native'

type FormErrors = {
	email?: string
	password?: string
}

export default function Login() {
	const bottomSpace = useScrollBottomSpace(48)
	const { login } = useAuth()

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
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
		} catch (err) {
			if (err instanceof ApiValidationError) {
				const apiErrors: FormErrors = {}

				if (err.errors.email?.[0]) {
					apiErrors.email = err.errors.email[0]
				}

				if (err.errors.password?.[0]) {
					apiErrors.password = err.errors.password[0]
				}

				if (Object.keys(apiErrors).length > 0) {
					setErrors(apiErrors)
				} else {
					setError('Revisa tus datos e inténtalo de nuevo.')
				}

				return
			}

			setError(
				err instanceof Error ? err.message : 'No fue posible iniciar sesión.',
			)
		} finally {
			setLoading(false)
		}
	}

	return (
		<KeyboardAvoidingView
			className='flex-1'
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
		>
			<ImageBackground
				source={require('../../assets/images/login-background.png')}
				resizeMode='cover'
				className='flex-1'
			>
				<View pointerEvents='none' className='absolute inset-0 bg-blanco/10' />

				<ScrollView
					className='flex-1'
					contentContainerStyle={{
						flexGrow: 1,
						paddingHorizontal: 24,
						paddingTop: 36,
						paddingBottom: bottomSpace,
					}}
					keyboardShouldPersistTaps='handled'
					keyboardDismissMode='on-drag'
					showsVerticalScrollIndicator={false}
				>
					<View className='mt-20 items-center'>
						<Image
							source={require('../../assets/images/zooapp-logo.png')}
							resizeMode='contain'
							accessibilityLabel='Logo de ZooApp'
							className='h-28 w-32'
						/>
					</View>

					<AuthCard>
						<View className='items-center'>
							<Text className='text-h1 text-center'>¡Bienvenido a ZooApp!</Text>

							<Text className='text-subtitle mt-2 text-center'>
								Inicia sesión para continuar tu aventura.
							</Text>
						</View>

						<TextField
							label='Correo electrónico'
							className='mt-8'
							error={errors.email}
							value={email}
							onChangeText={(value) => {
								setEmail(value)
								clearFieldError('email')
							}}
							placeholder='correo@ejemplo.com'
							autoCapitalize='none'
							autoCorrect={false}
							keyboardType='email-address'
							textContentType='emailAddress'
						/>

						<PasswordField
							label='Contraseña'
							error={errors.password}
							value={password}
							onChangeText={(value) => {
								setPassword(value)
								clearFieldError('password')
							}}
							placeholder='Tu contraseña'
							autoCapitalize='none'
							textContentType='password'
						/>

						<TextLink
							label='¿Olvidaste tu contraseña?'
							onPress={() => router.push('/forgot-password')}
							className='mt-2 self-end'
						/>

						{error !== '' && (
							<Notice
								tone='error'
								title='No se pudo iniciar sesión'
								message={error}
								className='mt-4'
							/>
						)}

						<Button
							title='Iniciar sesión'
							onPress={handleLogin}
							loading={loading}
							className='mt-6'
						/>

						<AuthSwitchLink
							prompt='¿No tienes una cuenta?'
							label='Regístrate'
							onPress={() => router.push('/register')}
						/>
					</AuthCard>
				</ScrollView>
			</ImageBackground>
		</KeyboardAvoidingView>
	)
}
