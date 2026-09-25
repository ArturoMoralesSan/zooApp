import { colors, styles } from '@/styles/forgot-password'
import { Mail01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { router } from 'expo-router'
import { useState } from 'react'
import {
	Image,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	Text,
	TextInput,
	View,
} from 'react-native'

export default function ForgotPassword() {
	const [email, setEmail] = useState('')
	const [emailFocused, setEmailFocused] = useState(false)

	const handleRecover = () => {
		// Más adelante conectaremos aquí el endpoint de recuperación.
	}

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
		>
			{/* FONDO */}
			<View style={styles.background}>
				<Image
					source={require('../../assets/images/login-background.png')}
					style={styles.backgroundImage}
					resizeMode='cover'
				/>
			</View>

			<View style={styles.content}>
				{/* VOLVER */}
				<Pressable onPress={() => router.back()} style={styles.backButton}>
					<Text style={styles.backText}>‹ Regresar</Text>
				</Pressable>

				{/* LOGO */}
				<View style={styles.logoContainer}>
					<Image
						source={require('../../assets/images/zooapp-logo.png')}
						style={styles.logo}
						resizeMode='contain'
					/>
				</View>

				{/* CARD */}
				<View style={styles.card}>
					{/* ENCABEZADO */}
					<View style={styles.header}>
						<Text style={styles.title}>¿Olvidaste tu contraseña?</Text>

						<Text style={styles.subtitle}>
							Ingresa tu correo electrónico y te enviaremos instrucciones para
							recuperar el acceso a tu cuenta.
						</Text>
					</View>

					{/* EMAIL */}
					<Text style={styles.label}>Correo electrónico</Text>

					<View
						style={[
							styles.inputContainer,
							{
								borderColor: emailFocused ? colors.primary : colors.border,
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
							onChangeText={setEmail}
							onFocus={() => setEmailFocused(true)}
							onBlur={() => setEmailFocused(false)}
							placeholder='correo@ejemplo.com'
							placeholderTextColor={colors.muted}
							autoCapitalize='none'
							autoCorrect={false}
							keyboardType='email-address'
							autoComplete='email'
							returnKeyType='done'
							onSubmitEditing={handleRecover}
							style={styles.input}
						/>
					</View>

					{/* ENVIAR */}
					<Pressable style={styles.sendButton} onPress={handleRecover}>
						{({ pressed }) => (
							<View
								style={[
									styles.sendButtonContent,
									pressed && styles.sendButtonPressed,
								]}
							>
								<Text style={styles.sendButtonText}>Enviar instrucciones</Text>
							</View>
						)}
					</Pressable>

					{/* LOGIN */}
					<View style={styles.loginRow}>
						<Text style={styles.loginText}>¿Recuerdas tu contraseña? </Text>

						<Pressable
							style={styles.loginButton}
							onPress={() => router.replace('/login')}
						>
							<Text style={styles.loginButtonText}>Iniciar sesión</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</KeyboardAvoidingView>
	)
}
