import { useAuth } from '@/contexts/AuthContext'
import { ApiValidationError } from '@/services/api'
import { colors, styles } from '@/styles/register'
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
			style={styles.container}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
		>
			{/* Fondo */}
			<View style={styles.background}>
				<Image
					source={require('../../assets/images/login-background.png')}
					style={styles.backgroundImage}
					resizeMode='cover'
				/>
			</View>

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps='handled'
				keyboardDismissMode='on-drag'
				showsVerticalScrollIndicator={false}
			>
				{/* Volver */}
				<Pressable
					onPress={() => router.back()}
					style={({ pressed }) => [
						styles.backButton,
						pressed && styles.backButtonPressed,
					]}
				>
					<Text style={styles.backText}>‹ Regresar</Text>
				</Pressable>

				{/* Logo */}
				<View style={styles.logoContainer}>
					<Image
						source={require('../../assets/images/zooapp-logo.png')}
						style={styles.logo}
						resizeMode='contain'
					/>
				</View>

				{/* Card */}
				<View style={styles.card}>
					{/* Encabezado */}
					<View style={styles.header}>
						<Text style={styles.title}>Crea tu cuenta</Text>

						<Text style={styles.subtitle}>
							Únete a ZooApp y comienza a descubrir el zoológico.
						</Text>
					</View>

					{/* Nombre */}
					<Text style={styles.labelFirst}>Nombre completo</Text>

					<View
						style={[
							styles.inputContainer,
							{
								borderColor: errors.name
									? colors.error
									: nameFocused
										? colors.primary
										: colors.border,
							},
						]}
					>
						<View style={styles.inputIcon}>
							<HugeiconsIcon
								icon={UserIcon}
								size={21}
								strokeWidth={1.8}
								color={nameFocused ? colors.primary : colors.muted}
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
							placeholderTextColor={colors.muted}
							autoCapitalize='words'
							style={styles.input}
						/>
					</View>

					{errors.name && <Text style={styles.fieldError}>{errors.name}</Text>}

					{/* Email */}
					<Text style={styles.label}>Correo electrónico</Text>

					<View
						style={[
							styles.inputContainer,
							{
								borderColor: errors.email
									? colors.error
									: emailFocused
										? colors.primary
										: colors.border,
							},
						]}
					>
						<View style={styles.inputIcon}>
							<HugeiconsIcon
								icon={Mail01Icon}
								size={21}
								strokeWidth={1.8}
								color={emailFocused ? colors.primary : colors.muted}
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
							placeholderTextColor={colors.muted}
							keyboardType='email-address'
							autoCapitalize='none'
							autoCorrect={false}
							style={styles.input}
						/>
					</View>

					{errors.email && (
						<Text style={styles.fieldError}>{errors.email}</Text>
					)}

					{/* Password */}
					<Text style={styles.label}>Contraseña</Text>

					<View
						style={[
							styles.inputContainer,
							{
								borderColor: errors.password
									? colors.error
									: passwordFocused
										? colors.primary
										: colors.border,
							},
						]}
					>
						<View style={styles.inputIcon}>
							<HugeiconsIcon
								icon={LockPasswordIcon}
								size={21}
								strokeWidth={1.8}
								color={passwordFocused ? colors.primary : colors.muted}
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
							placeholderTextColor={colors.muted}
							secureTextEntry={!showPassword}
							autoCapitalize='none'
							style={styles.input}
						/>

						<Pressable
							onPress={() => setShowPassword(!showPassword)}
							style={styles.passwordToggle}
							hitSlop={8}
						>
							<HugeiconsIcon
								icon={showPassword ? ViewOffSlashIcon : ViewIcon}
								size={21}
								strokeWidth={1.8}
								color={passwordFocused ? colors.primary : colors.muted}
							/>
						</Pressable>
					</View>

					{errors.password && (
						<Text style={styles.fieldError}>{errors.password}</Text>
					)}

					{/* Confirmar password */}
					<Text style={styles.label}>Confirmar contraseña</Text>

					<View
						style={[
							styles.inputContainer,
							{
								borderColor: errors.password_confirmation
									? colors.error
									: passwordConfirmationFocused
										? colors.primary
										: colors.border,
							},
						]}
					>
						<View style={styles.inputIcon}>
							<HugeiconsIcon
								icon={LockPasswordIcon}
								size={21}
								strokeWidth={1.8}
								color={
									passwordConfirmationFocused ? colors.primary : colors.muted
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
							placeholderTextColor={colors.muted}
							secureTextEntry={!showPasswordConfirmation}
							autoCapitalize='none'
							style={styles.input}
						/>

						<Pressable
							onPress={() =>
								setShowPasswordConfirmation(!showPasswordConfirmation)
							}
							style={styles.passwordToggle}
							hitSlop={8}
						>
							<HugeiconsIcon
								icon={showPasswordConfirmation ? ViewOffSlashIcon : ViewIcon}
								size={21}
								strokeWidth={1.8}
								color={
									passwordConfirmationFocused ? colors.primary : colors.muted
								}
							/>
						</Pressable>
					</View>

					{errors.password_confirmation && (
						<Text style={styles.fieldError}>
							{errors.password_confirmation}
						</Text>
					)}

					{/* Error general */}
					{error !== '' && (
						<View style={styles.generalError}>
							<Text style={styles.generalErrorText}>{error}</Text>
						</View>
					)}

					{/* Crear cuenta */}
					<Pressable
						onPress={handleRegister}
						disabled={loading}
						style={[
							styles.registerButton,
							loading && styles.registerButtonDisabled,
						]}
					>
						{({ pressed }) => (
							<View
								style={[
									styles.registerButtonContent,
									pressed && styles.registerButtonPressed,
								]}
							>
								{loading ? (
									<ActivityIndicator color={colors.white} />
								) : (
									<Text style={styles.registerButtonText}>Crear cuenta</Text>
								)}
							</View>
						)}
					</Pressable>

					{/* Login */}
					<View style={styles.loginRow}>
						<Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>

						<Pressable
							onPress={() => router.replace('/login')}
							style={styles.loginButton}
						>
							<Text style={styles.loginButtonText}>Inicia sesión</Text>
						</Pressable>
					</View>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
