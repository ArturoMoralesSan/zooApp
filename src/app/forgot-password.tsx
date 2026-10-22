import ActionButton from '@/components/ActionButton'
import BackButton from '@/components/BackButton'
import { Mail01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
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
	TextInput,
	View,
} from 'react-native'

const palette = {
	label: '#132519',
	border: '#3f775e',
	primary: '#1b7747',
	register: '#3b543e',
	title: '#26523f',
	muted: '#6F8A7D',
	error: '#C83B3B',
}

export default function ForgotPassword() {
	const [email, setEmail] = useState('')
	const [emailFocused, setEmailFocused] = useState(false)
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
					{/* REGRESAR */}
					<BackButton onPress={() => router.back()} />

					{/* LOGO */}
					<View className='mt-24 items-center'>
						<Image
							source={require('../../assets/images/zooapp-logo.png')}
							resizeMode='contain'
							accessibilityLabel='Logo de ZooApp'
							className='h-32 w-36'
						/>
					</View>

					{/* TARJETA */}
					<View className='mt-6 rounded-3xl bg-white p-5'>
						{/* ENCABEZADO */}
						<View className='items-center'>
							<Text
								className='text-center text-3xl font-bold'
								style={{ color: palette.title }}
							>
								¿Olvidaste tu contraseña?
							</Text>

							<Text
								className='mt-3 text-center text-base'
								style={{ color: palette.register }}
							>
								Ingresa tu correo electrónico y te enviaremos instrucciones para
								recuperar el acceso a tu cuenta.
							</Text>
						</View>

						{/* CORREO */}
						<Text
							className='mb-2 mt-8 text-sm font-semibold'
							style={{ color: palette.label }}
						>
							Correo electrónico
						</Text>

						<View
							className='flex-row items-center rounded-xl border bg-white'
							style={{
								borderColor: error
									? palette.error
									: emailFocused
										? palette.primary
										: palette.border,
								borderWidth: emailFocused ? 2 : 1,
							}}
						>
							<View className='pl-4'>
								<HugeiconsIcon
									icon={Mail01Icon}
									size={20}
									strokeWidth={1.8}
									color={
										error
											? palette.error
											: emailFocused
												? palette.primary
												: palette.muted
									}
								/>
							</View>

							<TextInput
								value={email}
								onChangeText={(value) => {
									setEmail(value)
									setError('')
								}}
								onFocus={() => setEmailFocused(true)}
								onBlur={() => setEmailFocused(false)}
								placeholder='correo@ejemplo.com'
								placeholderTextColor='#84958A'
								autoCapitalize='none'
								autoCorrect={false}
								keyboardType='email-address'
								textContentType='emailAddress'
								autoComplete='email'
								returnKeyType='done'
								onSubmitEditing={handleRecover}
								className='min-h-14 flex-1 px-3 py-3 text-base text-[#132519]'
							/>
						</View>

						{/* ERROR */}
						{error !== '' && (
							<View className='mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3'>
								<Text className='text-sm text-red-700'>{error}</Text>
							</View>
						)}

						{/* ENVIAR INSTRUCCIONES */}
						<ActionButton
							title='Enviar instrucciones'
							onPress={handleRecover}
						/>

						{/* VOLVER AL LOGIN */}
						<View className='mt-7 flex-row flex-wrap items-center justify-center'>
							<Text className='text-base' style={{ color: palette.register }}>
								¿Recuerdas tu contraseña?{' '}
							</Text>

							<Pressable
								onPress={() => router.replace('/login')}
								className='rounded-lg py-1'
								accessibilityRole='button'
							>
								<Text className='text-base font-bold text-[#1b7747]'>
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
