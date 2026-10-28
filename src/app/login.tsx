import ActionButton from '@/components/ActionButton'
import { useAuth } from '@/contexts/AuthContext'
import { ApiValidationError } from '@/services/api'
import colors from '@/theme/colors'
import {
	LockPasswordIcon,
	Mail01Icon,
	ViewIcon,
	ViewOffSlashIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
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
	TextInput,
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
	const { login } = useAuth()

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [errors, setErrors] = useState<FormErrors>({})
	const [emailFocused, setEmailFocused] = useState(false)
	const [passwordFocused, setPasswordFocused] = useState(false)

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
						paddingBottom: 48,
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
							<Text className='text-center text-[26px] font-bold leading-8 text-bosque'>
								¡Bienvenido a ZooApp!
							</Text>

							<Text className='mt-2 text-center text-sm text-tinta-2'>
								Inicia sesión para continuar tu aventura.
							</Text>
						</View>

						<Text className='mb-2 mt-7 text-xs font-semibold text-tinta'>
							Correo electrónico
						</Text>

						<View
							className={`flex-row items-center rounded-xl bg-blanco ${emailFocused ? 'border-2' : 'border'} ${errors.email ? 'border-error' : 'border-input-border'}`}
						>
							<View className='pl-3.5'>
								<HugeiconsIcon
									icon={Mail01Icon}
									size={20}
									strokeWidth={1.8}
									color={errors.email ? palette.error : palette.border}
								/>
							</View>

							<TextInput
								value={email}
								onChangeText={(value) => {
									setEmail(value)
									clearFieldError('email')
								}}
								onFocus={() => setEmailFocused(true)}
								onBlur={() => setEmailFocused(false)}
								placeholder='correo@ejemplo.com'
								placeholderTextColor={colors.apagado}
								autoCapitalize='none'
								autoCorrect={false}
								keyboardType='email-address'
								textContentType='emailAddress'
								className='min-h-12 flex-1 px-2.5 py-2.5 text-sm text-tinta'
							/>
						</View>

						{errors.email && (
							<Text className='mt-1 text-xs text-error'>{errors.email}</Text>
						)}

						<Text className='mb-2 mt-4 text-xs font-semibold text-tinta'>
							Contraseña
						</Text>

						<View
							className={`flex-row items-center rounded-xl bg-blanco ${passwordFocused ? 'border-2' : 'border'} ${errors.password ? 'border-error' : 'border-input-border'}`}
						>
							<View className='pl-3.5'>
								<HugeiconsIcon
									icon={LockPasswordIcon}
									size={20}
									strokeWidth={1.8}
									color={errors.password ? palette.error : palette.border}
								/>
							</View>

							<TextInput
								value={password}
								onChangeText={(value) => {
									setPassword(value)
									clearFieldError('password')
								}}
								onFocus={() => setPasswordFocused(true)}
								onBlur={() => setPasswordFocused(false)}
								placeholder='Tu contraseña'
								placeholderTextColor={colors.apagado}
								secureTextEntry={!showPassword}
								autoCapitalize='none'
								textContentType='password'
								className='min-h-12 flex-1 px-2.5 py-2.5 text-sm text-tinta'
							/>

							<Pressable
								onPress={() => setShowPassword((value) => !value)}
								className='mr-2 items-center justify-center rounded-xl p-2'
								hitSlop={8}
								accessibilityRole='button'
								accessibilityLabel={
									showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
								}
							>
								<HugeiconsIcon
									icon={showPassword ? ViewOffSlashIcon : ViewIcon}
									size={21}
									strokeWidth={1.8}
									color={palette.border}
								/>
							</Pressable>
						</View>

						{errors.password && (
							<Text className='mt-1 text-xs text-error'>{errors.password}</Text>
						)}

						{error !== '' && (
							<View className='mt-3.5 rounded-xl border border-error-border bg-error-bg px-3.5 py-2.5'>
								<Text className='text-xs text-error'>{error}</Text>
							</View>
						)}

						<Pressable
							onPress={() => router.push('/forgot-password')}
							className='mt-3.5 self-end rounded-lg py-1'
						>
							<Text className='text-xs font-semibold text-esmeralda'>
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
							<Text className='text-sm text-tinta-2'>
								¿No tienes una cuenta?{' '}
							</Text>

							<Pressable
								onPress={() => router.push('/register')}
								className='rounded-lg py-1'
							>
								<Text className='text-sm font-bold text-esmeralda'>
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
