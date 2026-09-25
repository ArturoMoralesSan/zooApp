import { useAuth } from '@/contexts/AuthContext'
import { ApiValidationError } from '@/services/api'
import { colors, styles } from '@/styles/login'
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
			style={styles.container}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
		>
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
				<View style={styles.logoContainer}>
					<Image
						source={require('../../assets/images/zooapp-logo.png')}
						style={styles.logo}
						resizeMode='contain'
					/>
				</View>

				<View style={styles.card}>
					<View style={styles.header}>
						<Text style={styles.title}>¡Bienvenido a ZooApp!</Text>

						<Text style={styles.subtitle}>
							Inicia sesión para continuar tu aventura.
						</Text>
					</View>

					<Text style={styles.labelFirst}>Correo electrónico</Text>

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
								size={20}
								strokeWidth={1.8}
								color={
									errors.email
										? colors.error
										: emailFocused
											? colors.primary
											: colors.muted
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
							placeholderTextColor={colors.muted}
							autoCapitalize='none'
							autoCorrect={false}
							keyboardType='email-address'
							style={styles.input}
						/>
					</View>

					{errors.email && (
						<Text style={styles.fieldError}>{errors.email}</Text>
					)}

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
								size={20}
								strokeWidth={1.8}
								color={
									errors.password
										? colors.error
										: passwordFocused
											? colors.primary
											: colors.muted
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

					{error !== '' && (
						<View style={styles.generalError}>
							<Text style={styles.generalErrorText}>{error}</Text>
						</View>
					)}

					<Pressable
						onPress={() => router.push('/forgot-password')}
						style={styles.forgotPassword}
					>
						<Text style={styles.forgotPasswordText}>
							¿Olvidaste tu contraseña?
						</Text>
					</Pressable>

					<Pressable
						onPress={handleLogin}
						disabled={loading}
						style={[styles.loginButton, loading && styles.loginButtonDisabled]}
					>
						<View style={styles.loginButtonContent}>
							{loading ? (
								<ActivityIndicator color={colors.white} />
							) : (
								<Text style={styles.loginButtonText}>Iniciar sesión</Text>
							)}
						</View>
					</Pressable>

					<View style={styles.registerRow}>
						<Text style={styles.registerText}>¿No tienes una cuenta? </Text>

						<Pressable
							onPress={() => router.push('/register')}
							style={styles.registerButton}
						>
							<Text style={styles.registerButtonText}>Regístrate</Text>
						</Pressable>
					</View>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
