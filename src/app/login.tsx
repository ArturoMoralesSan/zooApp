import ActionButton from '@/components/ActionButton'
import { useAuth } from '@/contexts/AuthContext'
import { ApiValidationError } from '@/services/api'
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
	label: '#132519',
	border: '#3f775e',
	forgot: '#1b7747',
	register: '#3b543e',
	title: '#26523f',
	muted: '#6F8A7D',
	error: '#C83B3B',
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
				<View pointerEvents='none' className='absolute inset-0 bg-white/10' />

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
					<View className='mt-24 items-center'>
						<Image
							source={require('../../assets/images/zooapp-logo.png')}
							resizeMode='contain'
							accessibilityLabel='Logo de ZooApp'
							className='h-32 w-36'
						/>
					</View>

					<View className='mt-6 rounded-3xl bg-white p-5'>
						<View className='items-center'>
							<Text
								className='text-center text-3xl font-bold'
								style={{ color: palette.title }}
							>
								¡Bienvenido a ZooApp!
							</Text>

							<Text className='mt-2 text-center text-base text-[#3b543e]'>
								Inicia sesión para continuar tu aventura.
							</Text>
						</View>

						<Text
							className='mb-2 mt-8 text-sm font-semibold'
							style={{ color: palette.label }}
						>
							Correo electrónico
						</Text>

						<View
							className='flex-row items-center rounded-xl border bg-white'
							style={{
								borderColor: errors.email ? palette.error : palette.border,
								borderWidth: emailFocused ? 2 : 1,
							}}
						>
							<View className='pl-4'>
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
								placeholderTextColor='#84958A'
								autoCapitalize='none'
								autoCorrect={false}
								keyboardType='email-address'
								textContentType='emailAddress'
								className='min-h-14 flex-1 px-3 py-3 text-base text-[#132519]'
							/>
						</View>

						{errors.email && (
							<Text className='mt-1 text-sm text-red-600'>{errors.email}</Text>
						)}

						<Text
							className='mb-2 mt-5 text-sm font-semibold'
							style={{ color: palette.label }}
						>
							Contraseña
						</Text>

						<View
							className='flex-row items-center rounded-xl border bg-white'
							style={{
								borderColor: errors.password ? palette.error : palette.border,
								borderWidth: passwordFocused ? 2 : 1,
							}}
						>
							<View className='pl-4'>
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
								placeholderTextColor='#84958A'
								secureTextEntry={!showPassword}
								autoCapitalize='none'
								textContentType='password'
								className='min-h-14 flex-1 px-3 py-3 text-base text-[#132519]'
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
							<Text className='mt-1 text-sm text-red-600'>
								{errors.password}
							</Text>
						)}

						{error !== '' && (
							<View className='mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3'>
								<Text className='text-sm text-red-700'>{error}</Text>
							</View>
						)}

						<Pressable
							onPress={() => router.push('/forgot-password')}
							className='mt-4 self-end rounded-lg py-1'
						>
							<Text
								className='text-sm font-semibold'
								style={{ color: palette.forgot }}
							>
								¿Olvidaste tu contraseña?
							</Text>
						</Pressable>

						<View className='mt-5'>
							{loading ? (
								<View className='h-[50px] w-full items-center justify-center rounded-xl bg-[#8BA997]'>
									<ActivityIndicator color='#FFFFFF' />
								</View>
							) : (
								<ActionButton title='Iniciar sesión' onPress={handleLogin} />
							)}
						</View>

						<View className='mt-7 flex-row flex-wrap items-center justify-center'>
							<Text className='text-base' style={{ color: palette.register }}>
								¿No tienes una cuenta?{' '}
							</Text>

							<Pressable
								onPress={() => router.push('/register')}
								className='rounded-lg py-1'
							>
								<Text className='text-base font-bold text-[#1b7747]'>
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
