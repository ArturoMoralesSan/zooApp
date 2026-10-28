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
	primary: '#1b7747',
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
					<View className='mt-[84px] items-center'>
						<Image
							source={require('../../assets/images/zooapp-logo.png')}
							resizeMode='contain'
							accessibilityLabel='Logo de ZooApp'
							className='h-28 w-[126px]'
						/>
					</View>

					{/* TARJETA */}
					<View className='mt-[21px] rounded-[21px] bg-white p-[17.5px]'>
						{/* ENCABEZADO */}
						<View className='items-center'>
							<Text className='text-center text-[26.25px] font-bold leading-[31.5px] text-[#26523f]'>
								¿Olvidaste tu contraseña?
							</Text>

							<Text className='mt-[10.5px] text-center text-[14px] leading-[21px] text-[#3b543e]'>
								Ingresa tu correo electrónico y te enviaremos instrucciones para
								recuperar el acceso a tu cuenta.
							</Text>
						</View>

						{/* CORREO */}
						<Text className='mb-[7px] mt-7 text-[12.25px] font-semibold leading-[17.5px] text-[#132519]'>
							Correo electrónico
						</Text>

						<View
							className={`flex-row items-center rounded-[10.5px] bg-white ${emailFocused ? 'border-2' : 'border'} ${error ? 'border-[#C83B3B]' : emailFocused ? 'border-[#1b7747]' : 'border-[#3f775e]'}`}
						>
							<View className='pl-3.5'>
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
								className='min-h-[49px] flex-1 px-[10.5px] py-[10.5px] text-[14px] leading-[21px] text-[#132519]'
							/>
						</View>

						{/* ERROR */}
						{error !== '' && (
							<View className='mt-[10.5px] rounded-[10.5px] border border-red-200 bg-red-50 px-3.5 py-[10.5px]'>
								<Text className='text-[12.25px] leading-[17.5px] text-red-700'>
									{error}
								</Text>
							</View>
						)}

						{/* ENVIAR INSTRUCCIONES */}
						<ActionButton
							title='Enviar instrucciones'
							onPress={handleRecover}
						/>

						{/* VOLVER AL LOGIN */}
						<View className='mt-[24.5px] flex-row flex-wrap items-center justify-center'>
							<Text className='text-[14px] leading-[21px] text-[#3b543e]'>
								¿Recuerdas tu contraseña?{' '}
							</Text>

							<Pressable
								onPress={() => router.replace('/login')}
								className='rounded-[7px] py-[3.5px]'
								accessibilityRole='button'
							>
								<Text className='text-[14px] font-bold leading-[21px] text-[#1b7747]'>
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
