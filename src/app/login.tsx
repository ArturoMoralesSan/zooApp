import { ApiValidationError } from '@/services/api'
import { login } from '@/services/auth'
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
			className='flex-1'
			style={{ backgroundColor: '#F7F7EE' }}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
		>
			{/* FONDO */}
			<View className='absolute inset-0 overflow-hidden'>
				<Image
					source={require('../../assets/images/login-background.png')}
					className='h-full w-full'
					resizeMode='cover'
					style={{
						transform: [{ scale: 1 }],
					}}
				/>
			</View>

			<ScrollView
				className='flex-1'
				contentContainerStyle={{
					paddingHorizontal: 24,
					paddingTop: 45,
					paddingBottom: 100,
				}}
				keyboardShouldPersistTaps='handled'
				keyboardDismissMode='on-drag'
				showsVerticalScrollIndicator={false}
			>
				{/* LOGO */}
				<View className='mt-12 items-center'>
					<Image
						source={require('../../assets/images/zooapp-logo.png')}
						className='h-36 w-36'
						resizeMode='contain'
					/>
				</View>

				{/* CARD */}
				<View
					className='mt-8 rounded-3xl p-5 shadow-sm'
					style={{
						backgroundColor: '#F7F7EE',
					}}
				>
					{/* ENCABEZADO */}
					<View className='items-center'>
						<Text
							className='text-center text-3xl font-bold'
							style={{ color: '#123C32' }}
						>
							¡Bienvenido a ZooApp!
						</Text>

						<Text
							className='mt-2 text-center text-base'
							style={{ color: '#6F8A7D' }}
						>
							Inicia sesión para continuar tu aventura.
						</Text>
					</View>

					{/* EMAIL */}
					<Text
						className='mb-2 mt-8 text-sm font-semibold'
						style={{ color: '#123C32' }}
					>
						Correo electrónico
					</Text>

					<View
						className='flex-row items-center rounded-xl border'
						style={{
							backgroundColor: '#DCEFE5',
							borderColor: errors.email
								? '#C83B3B'
								: emailFocused
									? '#087A5A'
									: '#B8DCCA',
						}}
					>
						{/* ICONO EMAIL */}
						<View className='pl-4'>
							<HugeiconsIcon
								icon={Mail01Icon}
								size={20}
								strokeWidth={1.8}
								color={
									errors.email
										? '#C83B3B'
										: emailFocused
											? '#087A5A'
											: '#6F8A7D'
								}
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
							placeholderTextColor='#6F8A7D'
							autoCapitalize='none'
							autoCorrect={false}
							keyboardType='email-address'
							className='flex-1 px-3 py-4 text-base'
							style={{
								color: '#123C32',
							}}
						/>
					</View>

					{errors.email && (
						<Text className='mt-1 text-sm' style={{ color: '#C83B3B' }}>
							{errors.email}
						</Text>
					)}

					{/* PASSWORD */}
					<Text
						className='mb-2 mt-5 text-sm font-semibold'
						style={{ color: '#123C32' }}
					>
						Contraseña
					</Text>

					<View
						className='flex-row items-center rounded-xl border'
						style={{
							backgroundColor: '#DCEFE5',
							borderColor: errors.password
								? '#C83B3B'
								: passwordFocused
									? '#087A5A'
									: '#B8DCCA',
						}}
					>
						{/* ICONO CONTRASEÑA */}
						<View className='pl-4'>
							<HugeiconsIcon
								icon={LockPasswordIcon}
								size={20}
								strokeWidth={1.8}
								color={
									errors.password
										? '#C83B3B'
										: passwordFocused
											? '#087A5A'
											: '#6F8A7D'
								}
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
							placeholderTextColor='#6F8A7D'
							secureTextEntry={!showPassword}
							autoCapitalize='none'
							className='flex-1 px-3 py-4 text-base'
							style={{
								color: '#123C32',
							}}
						/>

						{/* OJO */}
						<Pressable
							onPress={() => setShowPassword(!showPassword)}
							className='mr-2 items-center justify-center rounded-xl p-2'
							hitSlop={8}
						>
							<HugeiconsIcon
								icon={showPassword ? ViewOffSlashIcon : ViewIcon}
								size={21}
								strokeWidth={1.8}
								color={passwordFocused ? '#087A5A' : '#6F8A7D'}
							/>
						</Pressable>
					</View>

					{errors.password && (
						<Text className='mt-1 text-sm' style={{ color: '#C83B3B' }}>
							{errors.password}
						</Text>
					)}

					{/* ERROR GENERAL */}
					{error !== '' && (
						<View
							className='mt-4 rounded-xl px-4 py-3'
							style={{
								backgroundColor: '#FFF1F0',
								borderWidth: 1,
								borderColor: '#FFE3E1',
							}}
						>
							<Text className='text-sm' style={{ color: '#C83B3B' }}>
								{error}
							</Text>
						</View>
					)}

					{/* RECUPERAR CONTRASEÑA */}
					<Pressable
						onPress={() => router.push('/forgot-password')}
						className='mt-4 self-end rounded-2xl px-1 py-1'
					>
						<Text
							className='text-sm font-semibold'
							style={{ color: '#087A5A' }}
						>
							¿Olvidaste tu contraseña?
						</Text>
					</Pressable>

					{/* LOGIN */}
					<Pressable
						onPress={handleLogin}
						disabled={loading}
						className={`mt-6 rounded-2xl ${loading ? 'opacity-60' : ''}`}
						style={{
							shadowColor: '#064D36',
							shadowOffset: {
								width: 0,
								height: 4,
							},
							shadowOpacity: 0.16,
							shadowRadius: 7,
							elevation: 4,
						}}
					>
						<View
							className='w-full items-center rounded-2xl px-5 py-4'
							style={{
								backgroundColor: '#087A5A',
							}}
						>
							{loading ? (
								<ActivityIndicator color='#FFFFFF' />
							) : (
								<Text
									className='text-base font-bold'
									style={{
										color: '#FFFFFF',
									}}
								>
									Iniciar sesión
								</Text>
							)}
						</View>
					</Pressable>

					{/* REGISTRO */}
					<View className='mt-8 flex-row justify-center'>
						<Text className='text-base' style={{ color: '#6F8A7D' }}>
							¿No tienes una cuenta?{' '}
						</Text>

						<Pressable
							onPress={() => router.push('/register')}
							className='rounded-2xl px-1'
						>
							<Text
								className='text-base font-bold'
								style={{ color: '#087A5A' }}
							>
								Regístrate
							</Text>
						</Pressable>
					</View>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
