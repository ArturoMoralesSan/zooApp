import { ApiValidationError } from '@/services/api'
import { register } from '@/services/auth'
import {
	LockPasswordIcon,
	Mail01Icon,
	UserIcon,
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

	const [nameFocused, setNameFocused] = useState(false)
	const [emailFocused, setEmailFocused] = useState(false)
	const [passwordFocused, setPasswordFocused] = useState(false)
	const [passwordConfirmationFocused, setPasswordConfirmationFocused] =
		useState(false)

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
					paddingBottom: 60,
				}}
				keyboardShouldPersistTaps='handled'
				keyboardDismissMode='on-drag'
				showsVerticalScrollIndicator={false}
			>
				{/* VOLVER */}
				<Pressable
					onPress={() => router.back()}
					className='flex-row items-center self-start rounded-2xl px-5 py-3'
					style={{
						backgroundColor: '#DCEFE5',
						borderWidth: 1,
						borderColor: '#B8DCCA',
					}}
				>
					<Text className='mr-1 text-lg font-bold' style={{ color: '#123C32' }}>
						‹
					</Text>

					<Text className='text-sm font-semibold' style={{ color: '#123C32' }}>
						Volver
					</Text>
				</Pressable>

				{/* LOGO */}
				<View className='items-center'>
					<Image
						source={require('../../assets/images/zooapp-logo.png')}
						className='h-36 w-36'
						resizeMode='contain'
					/>
				</View>

				{/* CARD */}
				<View
					className='mt-8 rounded-3xl p-5'
					style={{
						backgroundColor: '#F7F7EE',
						borderWidth: 1,
						borderColor: '#E5E8DF',
						shadowColor: '#123C32',
						shadowOffset: {
							width: 0,
							height: 4,
						},
						shadowOpacity: 0.1,
						shadowRadius: 10,
						elevation: 3,
					}}
				>
					{/* ENCABEZADO */}
					<View className='items-center'>
						<Text
							className='text-center text-3xl font-bold'
							style={{ color: '#123C32' }}
						>
							Crea tu cuenta
						</Text>

						<Text
							className='mt-2 text-center text-base'
							style={{ color: '#6F8A7D' }}
						>
							Únete a ZooApp y comienza a descubrir el zoológico.
						</Text>
					</View>

					{/* NOMBRE */}
					<Text
						className='mb-2 mt-8 text-sm font-semibold'
						style={{ color: '#123C32' }}
					>
						Nombre completo
					</Text>

					<View
						className='flex-row items-center rounded-xl border'
						style={{
							backgroundColor: '#DCEFE5',
							borderColor: errors.name
								? '#C83B3B'
								: nameFocused
									? '#087A5A'
									: '#B8DCCA',
						}}
					>
						<View className='pl-4'>
							<HugeiconsIcon
								icon={UserIcon}
								size={21}
								strokeWidth={1.8}
								color={nameFocused ? '#087A5A' : '#6F8A7D'}
							/>
						</View>

						<TextInput
							value={name}
							onChangeText={(value) => {
								setName(value)
								clearFieldError('name')
							}}
							onFocus={() => setNameFocused(true)}
							onBlur={() => setNameFocused(false)}
							placeholder='Tu nombre'
							placeholderTextColor='#6F8A7D'
							autoCapitalize='words'
							className='flex-1 px-3 py-4 text-base'
							style={{
								color: '#123C32',
							}}
						/>
					</View>

					{errors.name && (
						<Text className='mt-1 text-sm' style={{ color: '#C83B3B' }}>
							{errors.name}
						</Text>
					)}

					{/* EMAIL */}
					<Text
						className='mb-2 mt-5 text-sm font-semibold'
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
						<View className='pl-4'>
							<HugeiconsIcon
								icon={Mail01Icon}
								size={21}
								strokeWidth={1.8}
								color={emailFocused ? '#087A5A' : '#6F8A7D'}
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
							keyboardType='email-address'
							autoCapitalize='none'
							autoCorrect={false}
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
						<View className='pl-4'>
							<HugeiconsIcon
								icon={LockPasswordIcon}
								size={21}
								strokeWidth={1.8}
								color={passwordFocused ? '#087A5A' : '#6F8A7D'}
							/>
						</View>

						<TextInput
							value={password}
							onChangeText={(value) => {
								setPassword(value)
								clearFieldError('password')
								clearFieldError('password_confirmation')
							}}
							onFocus={() => setPasswordFocused(true)}
							onBlur={() => setPasswordFocused(false)}
							placeholder='Mínimo 8 caracteres'
							placeholderTextColor='#6F8A7D'
							secureTextEntry={!showPassword}
							autoCapitalize='none'
							className='flex-1 px-3 py-4 text-base'
							style={{
								color: '#123C32',
							}}
						/>

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

					{/* CONFIRMAR PASSWORD */}
					<Text
						className='mb-2 mt-5 text-sm font-semibold'
						style={{ color: '#123C32' }}
					>
						Confirmar contraseña
					</Text>

					<View
						className='flex-row items-center rounded-xl border'
						style={{
							backgroundColor: '#DCEFE5',
							borderColor: errors.password_confirmation
								? '#C83B3B'
								: passwordConfirmationFocused
									? '#087A5A'
									: '#B8DCCA',
						}}
					>
						<View className='pl-4'>
							<HugeiconsIcon
								icon={LockPasswordIcon}
								size={21}
								strokeWidth={1.8}
								color={passwordConfirmationFocused ? '#087A5A' : '#6F8A7D'}
							/>
						</View>

						<TextInput
							value={passwordConfirmation}
							onChangeText={(value) => {
								setPasswordConfirmation(value)
								clearFieldError('password_confirmation')
							}}
							onFocus={() => setPasswordConfirmationFocused(true)}
							onBlur={() => setPasswordConfirmationFocused(false)}
							placeholder='Repite tu contraseña'
							placeholderTextColor='#6F8A7D'
							secureTextEntry={!showPasswordConfirmation}
							autoCapitalize='none'
							className='flex-1 px-3 py-4 text-base'
							style={{
								color: '#123C32',
							}}
						/>

						<Pressable
							onPress={() =>
								setShowPasswordConfirmation(!showPasswordConfirmation)
							}
							className='mr-2 items-center justify-center rounded-xl p-2'
							hitSlop={8}
						>
							<HugeiconsIcon
								icon={showPasswordConfirmation ? ViewOffSlashIcon : ViewIcon}
								size={21}
								strokeWidth={1.8}
								color={passwordConfirmationFocused ? '#087A5A' : '#6F8A7D'}
							/>
						</Pressable>
					</View>

					{errors.password_confirmation && (
						<Text className='mt-1 text-sm' style={{ color: '#C83B3B' }}>
							{errors.password_confirmation}
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

					{/* CREAR CUENTA */}
					<Pressable
						onPress={handleRegister}
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
						{({ pressed }) => (
							<View
								className='w-full items-center rounded-2xl px-5 py-4'
								style={{
									backgroundColor: pressed ? '#064D36' : '#087A5A',
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
										Crear cuenta
									</Text>
								)}
							</View>
						)}
					</Pressable>

					{/* LOGIN */}
					<View className='mt-8 flex-row justify-center'>
						<Text className='text-base' style={{ color: '#6F8A7D' }}>
							¿Ya tienes una cuenta?{' '}
						</Text>

						<Pressable
							onPress={() => router.replace('/login')}
							className='rounded-2xl px-1'
						>
							<Text
								className='text-base font-bold'
								style={{ color: '#087A5A' }}
							>
								Inicia sesión
							</Text>
						</Pressable>
					</View>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
