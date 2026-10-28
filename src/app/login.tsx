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
	border: '#3f775e',
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
					<View className='mt-[84px] items-center'>
						<Image
							source={require('../../assets/images/zooapp-logo.png')}
							resizeMode='contain'
							accessibilityLabel='Logo de ZooApp'
							className='h-28 w-[126px]'
						/>
					</View>

					<View className='mt-[21px] rounded-[21px] bg-white p-[17.5px]'>
						<View className='items-center'>
							<Text className='text-center text-[26.25px] font-bold leading-[31.5px] text-[#26523f]'>
								¡Bienvenido a ZooApp!
							</Text>

							<Text className='mt-[7px] text-center text-[14px] leading-[21px] text-[#3b543e]'>
								Inicia sesión para continuar tu aventura.
							</Text>
						</View>

						<Text className='mb-[7px] mt-7 text-[12.25px] font-semibold leading-[17.5px] text-[#132519]'>
							Correo electrónico
						</Text>

						<View
							className={`flex-row items-center rounded-[10.5px] bg-white ${emailFocused ? 'border-2' : 'border'} ${errors.email ? 'border-[#C83B3B]' : 'border-[#3f775e]'}`}
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
								placeholderTextColor='#84958A'
								autoCapitalize='none'
								autoCorrect={false}
								keyboardType='email-address'
								textContentType='emailAddress'
								className='min-h-[49px] flex-1 px-[10.5px] py-[10.5px] text-[14px] leading-[21px] text-[#132519]'
							/>
						</View>

						{errors.email && (
							<Text className='mt-[3.5px] text-[12.25px] leading-[17.5px] text-red-600'>
								{errors.email}
							</Text>
						)}

						<Text className='mb-[7px] mt-[17.5px] text-[12.25px] font-semibold leading-[17.5px] text-[#132519]'>
							Contraseña
						</Text>

						<View
							className={`flex-row items-center rounded-[10.5px] bg-white ${passwordFocused ? 'border-2' : 'border'} ${errors.password ? 'border-[#C83B3B]' : 'border-[#3f775e]'}`}
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
								placeholderTextColor='#84958A'
								secureTextEntry={!showPassword}
								autoCapitalize='none'
								textContentType='password'
								className='min-h-[49px] flex-1 px-[10.5px] py-[10.5px] text-[14px] leading-[21px] text-[#132519]'
							/>

							<Pressable
								onPress={() => setShowPassword((value) => !value)}
								className='mr-[7px] items-center justify-center rounded-[10.5px] p-[7px]'
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
							<Text className='mt-[3.5px] text-[12.25px] leading-[17.5px] text-red-600'>
								{errors.password}
							</Text>
						)}

						{error !== '' && (
							<View className='mt-3.5 rounded-[10.5px] border border-red-200 bg-red-50 px-3.5 py-[10.5px]'>
								<Text className='text-[12.25px] leading-[17.5px] text-red-700'>
									{error}
								</Text>
							</View>
						)}

						<Pressable
							onPress={() => router.push('/forgot-password')}
							className='mt-3.5 self-end rounded-[7px] py-[3.5px]'
						>
							<Text className='text-[12.25px] font-semibold leading-[17.5px] text-[#1b7747]'>
								¿Olvidaste tu contraseña?
							</Text>
						</Pressable>

						<View className='mt-[17.5px]'>
							{loading ? (
								<View className='h-[50px] w-full items-center justify-center rounded-[10.5px] bg-[#8BA997]'>
									<ActivityIndicator color={colors.blanco} />
								</View>
							) : (
								<ActionButton title='Iniciar sesión' onPress={handleLogin} />
							)}
						</View>

						<View className='mt-[24.5px] flex-row flex-wrap items-center justify-center'>
							<Text className='text-[14px] leading-[21px] text-[#3b543e]'>
								¿No tienes una cuenta?{' '}
							</Text>

							<Pressable
								onPress={() => router.push('/register')}
								className='rounded-[7px] py-[3.5px]'
							>
								<Text className='text-[14px] font-bold leading-[21px] text-[#1b7747]'>
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
