import ActionButton from '@/components/ActionButton'
import { useScrollBottomSpace } from '@/theme/layout'
import BackButton from '@/components/ui/BackButton'
import { Mail01Icon } from '@hugeicons/core-free-icons'
import { router } from 'expo-router'
import { useState } from 'react'
import {
	Image,
	ImageBackground,
	KeyboardAvoidingView,
	Platform,
	Pressable,
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
					<BackButton onPress={() => router.back()} />

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
					<View className='mt-5 rounded-3xl bg-blanco p-4'>
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
							icon={Mail01Icon}
							className='mt-8'
							invalid={Boolean(error)}
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

						{/* ERROR */}
						{error !== '' && (
							<View className='mt-2.5 rounded-xl border border-error-border bg-error-bg px-3.5 py-2.5'>
								<Text className='text-meta text-error'>{error}</Text>
							</View>
						)}

						{/* ENVIAR INSTRUCCIONES */}
						<ActionButton
							title='Enviar instrucciones'
							onPress={handleRecover}
						/>

						{/* VOLVER AL LOGIN */}
						<View className='mt-6 flex-row flex-wrap items-center justify-center'>
							<Text className='text-body text-tinta-2'>
								¿Recuerdas tu contraseña?{' '}
							</Text>

							<Pressable
								onPress={() => router.replace('/login')}
								className='rounded-lg py-1'
								accessibilityRole='button'
							>
								<Text className='font-sans-bold text-[14px] leading-[1.5] text-esmeralda'>
									Iniciar sesión
								</Text>
							</Pressable>
						</View>
					</View>
				</ScrollView>
			</ImageBackground>
		</KeyboardAvoidingView>
	)
}
