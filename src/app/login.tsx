import ActionButton from '@/components/ActionButton'
import { useScrollBottomSpace } from '@/theme/layout'
import { useAuth } from '@/contexts/AuthContext'
import { ApiValidationError } from '@/services/api'
import colors from '@/theme/colors'
import { PasswordField } from '@/components/ui/PasswordField'
import { TextField } from '@/components/ui/TextField'
import { LockPasswordIcon, Mail01Icon } from '@hugeicons/core-free-icons'
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

type FormErrors = {
	email?: string
	password?: string
}

const palette = {
	border: colors.inputBorder,
	error: colors.error,
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

					<View className='mt-5 rounded-3xl bg-blanco p-4'>
						<View className='items-center'>
							<Text className='text-h1 text-center'>¡Bienvenido a ZooApp!</Text>

							<Text className='text-subtitle mt-2 text-center'>
								Inicia sesión para continuar tu aventura.
							</Text>
						</View>

						<TextField
							label='Correo electrónico'
							icon={Mail01Icon}
							labelClassName='mb-2 mt-7 text-[14px] font-sans-semibold text-tinta'
							error={errors.email}
							highlightOnFocus={false}
							iconColor={palette.border}
							iconErrorColor={palette.error}
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
							icon={LockPasswordIcon}
							error={errors.password}
							highlightOnFocus={false}
							iconColor={palette.border}
							iconErrorColor={palette.error}
							value={password}
							onChangeText={(value) => {
								setPassword(value)
								clearFieldError('password')
							}}
							placeholder='Tu contraseña'
							autoCapitalize='none'
							textContentType='password'
						/>

						{error !== '' && (
							<View className='mt-3.5 rounded-xl border border-error-border bg-error-bg px-3.5 py-2.5'>
								<Text className='text-meta text-error'>{error}</Text>
							</View>
						)}

						<Pressable
							onPress={() => router.push('/forgot-password')}
							className='mt-3.5 self-end rounded-lg py-1'
						>
							<Text className='text-meta text-esmeralda'>
								¿Olvidaste tu contraseña?
							</Text>
						</Pressable>

						<View className='mt-4'>
							{loading ? (
								<View className='h-[50px] w-full items-center justify-center rounded-xl bg-apagado'>
									<ActivityIndicator color={colors.blanco} />
								</View>
							) : (
								<ActionButton title='Iniciar sesión' onPress={handleLogin} />
							)}
						</View>

						<View className='mt-6 flex-row flex-wrap items-center justify-center'>
							<Text className='text-body text-tinta-2'>
								¿No tienes una cuenta?{' '}
							</Text>

							<Pressable
								onPress={() => router.push('/register')}
								className='rounded-lg py-1'
							>
								<Text className='font-sans-bold text-[14px] leading-[1.5] text-esmeralda'>
									Regístrate
								</Text>
							</Pressable>
						</View>
					</View>
				</ScrollView>
			</ImageBackground>
		</KeyboardAvoidingView>
	)
}
