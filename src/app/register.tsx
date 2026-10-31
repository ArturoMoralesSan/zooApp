import { AuthCard } from '@/components/auth/AuthCard'
import { AuthSwitchLink } from '@/components/auth/AuthSwitchLink'
import { Button } from '@/components/ui/Button'
import { Notice } from '@/components/ui/Notice'
import { KeyboardScrollView } from '@/components/ui/KeyboardScrollView'
import { useScrollBottomSpace } from '@/theme/layout'
import BackButton from '@/components/ui/BackButton'
import { RegisterHeader } from '@/components/auth/RegisterHeader'
import { useAuth } from '@/contexts/AuthContext'
import { ApiValidationError } from '@/services/api'
import { PasswordField } from '@/components/ui/PasswordField'
import { TextField } from '@/components/ui/TextField'
import type { RegisterFormErrors as FormErrors } from '@/types/auth'
import { validateRegisterForm } from '@/utils/auth'
import { router } from 'expo-router'
import { useState } from 'react'
import { Image, ImageBackground, View } from 'react-native'

export default function Register() {
	const bottomSpace = useScrollBottomSpace(48)
	const { register } = useAuth()

	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [passwordConfirmation, setPasswordConfirmation] = useState('')

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
		if (loading) return

		setError('')
		setErrors({})

		const localErrors = validateRegisterForm({
			name,
			email,
			password,
			passwordConfirmation,
		})

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
		} catch (err) {
			if (err instanceof ApiValidationError) {
				const apiErrors: FormErrors = {}

				if (err.errors.name?.[0]) {
					apiErrors.name = err.errors.name[0]
				}

				if (err.errors.email?.[0]) {
					apiErrors.email = err.errors.email[0]
				}

				if (err.errors.password?.[0]) {
					apiErrors.password = err.errors.password[0]
				}

				if (err.errors.password_confirmation?.[0]) {
					apiErrors.password_confirmation = err.errors.password_confirmation[0]
				}

				if (Object.keys(apiErrors).length > 0) {
					setErrors(apiErrors)
				} else {
					setError('Revisa tus datos e inténtalo de nuevo.')
				}

				return
			}

			setError(
				err instanceof Error ? err.message : 'No fue posible crear la cuenta.',
			)
		} finally {
			setLoading(false)
		}
	}

	return (
		<ImageBackground
			source={require('../../assets/images/login-background.png')}
			resizeMode='cover'
			className='flex-1'
		>
			<View pointerEvents='none' className='absolute inset-0 bg-blanco/10' />

			<KeyboardScrollView
				className='flex-1'
				contentContainerStyle={{
					flexGrow: 1,
					paddingHorizontal: 20,
					paddingTop: 36,
					paddingBottom: bottomSpace,
				}}
			>
				{/* REGRESAR */}
				<BackButton variant='outline' onPress={() => router.back()} />

				{/* LOGO */}
				<View className='mt-7 items-center'>
					<Image
						source={require('../../assets/images/zooapp-logo.png')}
						resizeMode='contain'
						accessibilityLabel='Logo de ZooApp'
						className='h-28 w-32'
					/>
				</View>

				{/* TARJETA */}
				<AuthCard>
					{/* ENCABEZADO */}
					<RegisterHeader />

					{/* NOMBRE */}
					<TextField
						label='Nombre completo'
						className='mt-8'
						error={errors.name}
						value={name}
						onChangeText={(value) => {
							setName(value)
							clearFieldError('name')
						}}
						placeholder='Tu nombre'
						autoCapitalize='words'
						autoCorrect={false}
						returnKeyType='next'
					/>

					{/* CORREO */}
					<TextField
						label='Correo electrónico'
						error={errors.email}
						value={email}
						onChangeText={(value) => {
							setEmail(value)
							clearFieldError('email')
						}}
						placeholder='correo@ejemplo.com'
						keyboardType='email-address'
						autoCapitalize='none'
						autoCorrect={false}
						textContentType='emailAddress'
						autoComplete='email'
						returnKeyType='next'
					/>

					{/* CONTRASEÑA */}
					<PasswordField
						label='Contraseña'
						error={errors.password}
						value={password}
						onChangeText={(value) => {
							setPassword(value)
							clearFieldError('password')
							clearFieldError('password_confirmation')
						}}
						placeholder='Mínimo 8 caracteres'
						autoCapitalize='none'
						autoCorrect={false}
						textContentType='newPassword'
						autoComplete='new-password'
						returnKeyType='next'
					/>

					{/* CONFIRMAR CONTRASEÑA */}
					<PasswordField
						label='Confirmar contraseña'
						error={errors.password_confirmation}
						showLabel='Mostrar confirmación de contraseña'
						hideLabel='Ocultar confirmación de contraseña'
						value={passwordConfirmation}
						onChangeText={(value) => {
							setPasswordConfirmation(value)
							clearFieldError('password_confirmation')
						}}
						placeholder='Repite tu contraseña'
						autoCapitalize='none'
						autoCorrect={false}
						textContentType='newPassword'
						autoComplete='new-password'
						returnKeyType='done'
						onSubmitEditing={handleRegister}
					/>

					{/* ERROR GENERAL */}
					{error !== '' && (
						<Notice
							tone='error'
							title='No se pudo crear la cuenta'
							message={error}
							className='mt-5'
						/>
					)}

					{/* BOTÓN CREAR CUENTA */}
					<Button
						title='Crear cuenta'
						onPress={handleRegister}
						loading={loading}
						className='mt-8'
					/>

					{/* INICIAR SESIÓN */}
					<AuthSwitchLink
						prompt='¿Ya tienes una cuenta?'
						label='Inicia sesión'
						onPress={() => router.replace('/login')}
					/>
				</AuthCard>
			</KeyboardScrollView>
		</ImageBackground>
	)
}
