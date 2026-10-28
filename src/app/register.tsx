import ActionButton from '@/components/ActionButton'
import BackButton from '@/components/BackButton'
import { useAuth } from '@/contexts/AuthContext'
import { ApiValidationError } from '@/services/api'
import colors from '@/theme/colors'
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
	name?: string
	email?: string
	password?: string
	password_confirmation?: string
}

const palette = {
	primary: colors.esmeralda,
	muted: colors.tinta2,
}

export default function Register() {
	const { register } = useAuth()

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
		if (loading) return

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
							className='h-28 w-[126px]'
						/>
					</View>

					{/* TARJETA */}
					<View className='mt-[21px] rounded-[21px] bg-blanco p-[17.5px]'>
						{/* ENCABEZADO */}
						<View className='items-center'>
							<Text className='text-center text-[26.25px] font-bold leading-[31.5px] text-bosque'>
								Crea tu cuenta
							</Text>

							<Text className='mt-[7px] text-center text-[14px] leading-[21px] text-tinta-2'>
								Únete a ZooApp y comienza a descubrir el zoológico.
							</Text>
						</View>

						{/* NOMBRE */}
						<Text className='mb-[7px] mt-7 text-[12.25px] font-semibold leading-[17.5px] text-tinta'>
							Nombre completo
						</Text>

						<View
							className={`flex-row items-center rounded-[10.5px] bg-blanco ${nameFocused ? 'border-2' : 'border'} ${errors.name ? 'border-error' : nameFocused ? 'border-esmeralda' : 'border-input-border'}`}
						>
							<View className='pl-3.5'>
								<HugeiconsIcon
									icon={UserIcon}
									size={20}
									strokeWidth={1.8}
									color={nameFocused ? palette.primary : palette.muted}
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
								placeholderTextColor={colors.apagado}
								autoCapitalize='words'
								autoCorrect={false}
								returnKeyType='next'
								className='min-h-[49px] flex-1 px-[10.5px] py-[10.5px] text-[14px] leading-[21px] text-tinta'
							/>
						</View>

						{errors.name && (
							<Text className='mt-[3.5px] text-[12.25px] leading-[17.5px] text-error'>
								{errors.name}
							</Text>
						)}

						{/* CORREO */}
						<Text className='mb-[7px] mt-[17.5px] text-[12.25px] font-semibold leading-[17.5px] text-tinta'>
							Correo electrónico
						</Text>

						<View
							className={`flex-row items-center rounded-[10.5px] bg-blanco ${emailFocused ? 'border-2' : 'border'} ${errors.email ? 'border-error' : emailFocused ? 'border-esmeralda' : 'border-input-border'}`}
						>
							<View className='pl-3.5'>
								<HugeiconsIcon
									icon={Mail01Icon}
									size={20}
									strokeWidth={1.8}
									color={emailFocused ? palette.primary : palette.muted}
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
								keyboardType='email-address'
								autoCapitalize='none'
								autoCorrect={false}
								textContentType='emailAddress'
								autoComplete='email'
								returnKeyType='next'
								className='min-h-[49px] flex-1 px-[10.5px] py-[10.5px] text-[14px] leading-[21px] text-tinta'
							/>
						</View>

						{errors.email && (
							<Text className='mt-[3.5px] text-[12.25px] leading-[17.5px] text-error'>
								{errors.email}
							</Text>
						)}

						{/* CONTRASEÑA */}
						<Text className='mb-[7px] mt-[17.5px] text-[12.25px] font-semibold leading-[17.5px] text-tinta'>
							Contraseña
						</Text>

						<View
							className={`flex-row items-center rounded-[10.5px] bg-blanco ${passwordFocused ? 'border-2' : 'border'} ${errors.password ? 'border-error' : passwordFocused ? 'border-esmeralda' : 'border-input-border'}`}
						>
							<View className='pl-3.5'>
								<HugeiconsIcon
									icon={LockPasswordIcon}
									size={20}
									strokeWidth={1.8}
									color={passwordFocused ? palette.primary : palette.muted}
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
								placeholderTextColor={colors.apagado}
								secureTextEntry={!showPassword}
								autoCapitalize='none'
								autoCorrect={false}
								textContentType='newPassword'
								autoComplete='new-password'
								returnKeyType='next'
								className='min-h-[49px] flex-1 px-[10.5px] py-[10.5px] text-[14px] leading-[21px] text-tinta'
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
									color={passwordFocused ? palette.primary : palette.muted}
								/>
							</Pressable>
						</View>

						{errors.password && (
							<Text className='mt-[3.5px] text-[12.25px] leading-[17.5px] text-error'>
								{errors.password}
							</Text>
						)}

						{/* CONFIRMAR CONTRASEÑA */}
						<Text className='mb-[7px] mt-[17.5px] text-[12.25px] font-semibold leading-[17.5px] text-tinta'>
							Confirmar contraseña
						</Text>

						<View
							className={`flex-row items-center rounded-[10.5px] bg-blanco ${passwordConfirmationFocused ? 'border-2' : 'border'} ${errors.password_confirmation ? 'border-error' : passwordConfirmationFocused ? 'border-esmeralda' : 'border-input-border'}`}
						>
							<View className='pl-3.5'>
								<HugeiconsIcon
									icon={LockPasswordIcon}
									size={20}
									strokeWidth={1.8}
									color={
										passwordConfirmationFocused
											? palette.primary
											: palette.muted
									}
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
								placeholderTextColor={colors.apagado}
								secureTextEntry={!showPasswordConfirmation}
								autoCapitalize='none'
								autoCorrect={false}
								textContentType='newPassword'
								autoComplete='new-password'
								returnKeyType='done'
								onSubmitEditing={handleRegister}
								className='min-h-[49px] flex-1 px-[10.5px] py-[10.5px] text-[14px] leading-[21px] text-tinta'
							/>

							<Pressable
								onPress={() => setShowPasswordConfirmation((value) => !value)}
								className='mr-[7px] items-center justify-center rounded-[10.5px] p-[7px]'
								hitSlop={8}
								accessibilityRole='button'
								accessibilityLabel={
									showPasswordConfirmation
										? 'Ocultar confirmación de contraseña'
										: 'Mostrar confirmación de contraseña'
								}
							>
								<HugeiconsIcon
									icon={showPasswordConfirmation ? ViewOffSlashIcon : ViewIcon}
									size={21}
									strokeWidth={1.8}
									color={
										passwordConfirmationFocused
											? palette.primary
											: palette.muted
									}
								/>
							</Pressable>
						</View>

						{errors.password_confirmation && (
							<Text className='mt-[3.5px] text-[12.25px] leading-[17.5px] text-error'>
								{errors.password_confirmation}
							</Text>
						)}

						{/* ERROR GENERAL */}
						{error !== '' && (
							<View className='mt-3.5 rounded-[10.5px] border border-error-border bg-error-bg px-3.5 py-[10.5px]'>
								<Text className='text-[12.25px] leading-[17.5px] text-error'>
									{error}
								</Text>
							</View>
						)}

						{/* BOTÓN CREAR CUENTA */}
						{loading ? (
							<View className='mt-3.5 h-[50px] w-full items-center justify-center rounded-[10.5px] bg-apagado'>
								<ActivityIndicator color={colors.blanco} />
							</View>
						) : (
							<ActionButton title='Crear cuenta' onPress={handleRegister} />
						)}

						{/* INICIAR SESIÓN */}
						<View className='mt-[24.5px] flex-row flex-wrap items-center justify-center'>
							<Text className='text-[14px] leading-[21px] text-tinta-2'>
								¿Ya tienes una cuenta?{' '}
							</Text>

							<Pressable
								onPress={() => router.replace('/login')}
								className='rounded-[7px] py-[3.5px]'
								accessibilityRole='button'
							>
								<Text className='text-[14px] font-bold leading-[21px] text-esmeralda'>
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
