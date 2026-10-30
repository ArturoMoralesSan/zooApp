import { AuthCard } from '@/components/auth/AuthCard'
import { AuthSwitchLink } from '@/components/auth/AuthSwitchLink'
import { Button } from '@/components/ui/Button'
import { useScrollBottomSpace } from '@/theme/layout'
import BackButton from '@/components/ui/BackButton'
import { router } from 'expo-router'
import { useState } from 'react'
import {
	Image,
	ImageBackground,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	View,
} from 'react-native'
import { TextField } from '@/components/ui/TextField'

export default function ForgotPassword() {
	const bottomSpace = useScrollBottomSpace(48)
	const [email, setEmail] = useState('')
	const [error, setError] = useState('')

	const handleRecover = () => {
		setError('')

		if (!email.trim()) {
			setError('Ingresa tu correo electrónico.')
			return
		}

		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

		if (!emailPattern.test(email.trim())) {
			setError('Ingresa un correo electrónico válido.')
			return
		}

		// Aquí conectaremos el endpoint de recuperación de contraseña.
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
					{/* REGRESAR */}
					<BackButton variant='outline' onPress={() => router.back()} />

					{/* LOGO */}
					<View className='mt-20 items-center'>
						<Image
							source={require('../../assets/images/zooapp-logo.png')}
							resizeMode='contain'
							accessibilityLabel='Logo de ZooApp'
							className='h-28 w-32'
						/>
					</View>

					{/* TARJETA */}
					<AuthCard>
						{/* ENCABEZADO */}
						<View className='items-center'>
							<Text className='text-h1 text-center'>
								¿Olvidaste tu contraseña?
							</Text>

							<Text className='text-subtitle mt-2.5 text-center'>
								Ingresa tu correo electrónico y te enviaremos instrucciones para
								recuperar el acceso a tu cuenta.
							</Text>
						</View>

						{/* CORREO */}
						<TextField
							label='Correo electrónico'
							className='mt-8'
							error={error || undefined}
							value={email}
							onChangeText={(value) => {
								setEmail(value)
								setError('')
							}}
							placeholder='correo@ejemplo.com'
							autoCapitalize='none'
							autoCorrect={false}
							keyboardType='email-address'
							textContentType='emailAddress'
							autoComplete='email'
							returnKeyType='done'
							onSubmitEditing={handleRecover}
						/>

						{/* ENVIAR INSTRUCCIONES */}
						<Button
							title='Enviar instrucciones'
							onPress={handleRecover}
							className='mt-8'
						/>

						{/* VOLVER AL LOGIN */}
						<AuthSwitchLink
							prompt='¿Recuerdas tu contraseña?'
							label='Inicia sesión'
							onPress={() => router.replace('/login')}
						/>
					</AuthCard>
				</ScrollView>
			</ImageBackground>
		</KeyboardAvoidingView>
	)
}
