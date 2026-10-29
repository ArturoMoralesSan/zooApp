import ActionButton from '@/components/ActionButton'
import BackButton from '@/components/BackButton'
import { useAuth } from '@/contexts/AuthContext'
import { ApiValidationError } from '@/services/api'
import colors from '@/theme/colors'
import { PasswordField } from '@/components/ui/PasswordField'
import { TextField } from '@/components/ui/TextField'
import type { RegisterFormErrors as FormErrors } from '@/types/auth'
import { validateRegisterForm } from '@/utils/auth'
import {
	LockPasswordIcon,
	Mail01Icon,
	UserIcon,
} from '@hugeicons/core-free-icons'
import { router } from 'expo-router'
import { useState } from 'react'
import {
	ActivityIndicator,
	Image,
	ImageBackground,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	Text,
	View,
} from 'react-native'

export default function Register() {
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
						paddingBottom: 48,
					}}
					keyboardShouldPersistTaps='handled'
					keyboardDismissMode='on-drag'
					showsVerticalScrollIndicator={false}
				>
					{/* REGRESAR */}
					<BackButton onPress={() => router.back()} />

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
					<View className='mt-5 rounded-3xl bg-blanco p-4'>
						{/* ENCABEZADO */}
						<View className='items-center'>
							<Text className='text-center text-[26px] font-bold leading-8 text-bosque'>
								Crea tu cuenta
							</Text>

							<Text className='mt-2 text-center text-sm text-tinta-2'>
								Únete a ZooApp y comienza a descubrir el zoológico.
							</Text>
						</View>

						{/* NOMBRE */}
						<TextField
							label='Nombre completo'
							icon={UserIcon}
							labelClassName='mb-2 mt-7 text-xs font-semibold text-tinta'
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
							icon={Mail01Icon}
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
							icon={LockPasswordIcon}
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
							icon={LockPasswordIcon}
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
							<View className='mt-3.5 rounded-xl border border-error-border bg-error-bg px-3.5 py-2.5'>
								<Text className='text-xs text-error'>{error}</Text>
							</View>
						)}

						{/* BOTÓN CREAR CUENTA */}
						{loading ? (
							<View className='mt-3.5 h-[50px] w-full items-center justify-center rounded-xl bg-apagado'>
								<ActivityIndicator color={colors.blanco} />
							</View>
						) : (
							<ActionButton title='Crear cuenta' onPress={handleRegister} />
						)}

						{/* INICIAR SESIÓN */}
						<View className='mt-6 flex-row flex-wrap items-center justify-center'>
							<Text className='text-sm text-tinta-2'>
								¿Ya tienes una cuenta?{' '}
							</Text>

							<Pressable
								onPress={() => router.replace('/login')}
								className='rounded-lg py-1'
								accessibilityRole='button'
							>
								<Text className='text-sm font-bold text-esmeralda'>
									Inicia sesión
								</Text>
							</Pressable>
						</View>
					</View>
				</ScrollView>
			</ImageBackground>
		</KeyboardAvoidingView>
	)
}
