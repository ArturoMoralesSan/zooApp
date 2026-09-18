import { ArrowLeft01Icon, Mail01Icon } from '@hugeicons/core-free-icons'
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

			<View className='flex-1 px-6 pt-12'>
				{/* VOLVER */}
				<Pressable
					onPress={() => router.back()}
					className='mb-2 flex-row items-center self-start rounded-2xl px-5 py-3'
					style={{
						backgroundColor: '#DCEFE5',
						borderWidth: 1,
						borderColor: '#B8DCCA',
					}}
				>
					<HugeiconsIcon
						icon={ArrowLeft01Icon}
						size={19}
						strokeWidth={2}
						color='#123C32'
					/>

					<Text
						className='ml-1 text-sm font-semibold'
						style={{ color: '#123C32' }}
					>
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
					className='mt-3 rounded-3xl p-5'
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
							¿Olvidaste tu contraseña?
						</Text>

						<Text
							className='mt-2 text-center text-base'
							style={{ color: '#6F8A7D' }}
						>
							Ingresa tu correo electrónico y te enviaremos instrucciones para
							recuperar el acceso a tu cuenta.
						</Text>
					</View>

					{/* EMAIL */}
					<Text
						className='mb-2 mt-8 text-sm font-semibold'
						style={{ color: '#123C32' }}
					>
						Correo electrónico
					</Text>

					<View
						className='flex-row items-center rounded-xl border'
						style={{
							backgroundColor: '#DCEFE5',
							borderColor: emailFocused ? '#087A5A' : '#B8DCCA',
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
							onChangeText={setEmail}
							onFocus={() => setEmailFocused(true)}
							onBlur={() => setEmailFocused(false)}
							placeholder='correo@ejemplo.com'
							placeholderTextColor='#6F8A7D'
							autoCapitalize='none'
							autoCorrect={false}
							keyboardType='email-address'
							autoComplete='email'
							returnKeyType='done'
							onSubmitEditing={handleRecover}
							className='flex-1 px-3 py-4 text-base'
							style={{
								color: '#123C32',
							}}
						/>
					</View>

					{/* ENVIAR */}
					<Pressable
						className='mt-6 rounded-2xl'
						onPress={handleRecover}
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
								<Text
									className='text-base font-bold'
									style={{ color: '#FFFFFF' }}
								>
									Enviar instrucciones
								</Text>
							</View>
						)}
					</Pressable>

					{/* LOGIN */}
					<View className='mt-8 flex-row justify-center'>
						<Text className='text-base' style={{ color: '#6F8A7D' }}>
							¿Recuerdas tu contraseña?{' '}
						</Text>

						<Pressable
							className='rounded-2xl px-1'
							onPress={() => router.replace('/login')}
						>
							<Text
								className='text-base font-bold'
								style={{ color: '#087A5A' }}
							>
								Iniciar sesión
							</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</KeyboardAvoidingView>
	)
}
