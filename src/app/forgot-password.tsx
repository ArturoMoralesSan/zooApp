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
import colors from '@/theme/colors'

const palette = {
	primary: colors.esmeralda,
	muted: colors.tinta2,
	error: colors.error,
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
					<View className='mt-[84px] items-center'>
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
								¿Olvidaste tu contraseña?
							</Text>

							<Text className='mt-[10.5px] text-center text-[14px] leading-[21px] text-tinta-2'>
								Ingresa tu correo electrónico y te enviaremos instrucciones para
								recuperar el acceso a tu cuenta.
							</Text>
						</View>

						{/* CORREO */}
						<Text className='mb-[7px] mt-7 text-[12.25px] font-semibold leading-[17.5px] text-tinta'>
							Correo electrónico
						</Text>

						<View
							className={`flex-row items-center rounded-[10.5px] bg-blanco ${emailFocused ? 'border-2' : 'border'} ${error ? 'border-error' : emailFocused ? 'border-esmeralda' : 'border-input-border'}`}
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
								placeholderTextColor={colors.apagado}
								autoCapitalize='none'
								autoCorrect={false}
								keyboardType='email-address'
								textContentType='emailAddress'
								autoComplete='email'
								returnKeyType='done'
								onSubmitEditing={handleRecover}
								className='min-h-[49px] flex-1 px-[10.5px] py-[10.5px] text-[14px] leading-[21px] text-tinta'
							/>
						</View>

						{/* ERROR */}
						{error !== '' && (
							<View className='mt-[10.5px] rounded-[10.5px] border border-error-border bg-error-bg px-3.5 py-[10.5px]'>
								<Text className='text-[12.25px] leading-[17.5px] text-error'>
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
							<Text className='text-[14px] leading-[21px] text-tinta-2'>
								¿Recuerdas tu contraseña?{' '}
							</Text>

							<Pressable
								onPress={() => router.replace('/login')}
								className='rounded-[7px] py-[3.5px]'
								accessibilityRole='button'
							>
								<Text className='text-[14px] font-bold leading-[21px] text-esmeralda'>
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
