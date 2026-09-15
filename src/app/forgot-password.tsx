import { router } from 'expo-router'
import { useState } from 'react'
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from 'react-native'

export default function ForgotPassword() {
	const [email, setEmail] = useState('')

	const handleRecover = () => {
		// Más adelante conectaremos aquí el endpoint de recuperación.
	}

	return (
		<KeyboardAvoidingView
			className='flex-1 bg-white'
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
		>
			<ScrollView
				className='flex-1'
				contentContainerStyle={{
					flexGrow: 1,
					paddingHorizontal: 28,
					paddingTop: 56,
					paddingBottom: 80,
				}}
				keyboardShouldPersistTaps='handled'
				keyboardDismissMode='on-drag'
				showsVerticalScrollIndicator={false}
			>
				<Pressable
					className='mb-8 flex-row items-center self-start rounded-full bg-gray-100 px-5 py-3'
					onPress={() => router.back()}
				>
					<Text className='mr-1 text-lg font-bold text-gray-700'>‹</Text>

					<Text className='text-sm font-semibold text-gray-700'>Volver</Text>
				</Pressable>

				<View>
					<View className='h-16 w-16 items-center justify-center rounded-full bg-emerald-100'>
						<Text className='text-2xl font-bold text-emerald-700'>Z</Text>
					</View>

					<Text className='mt-5 text-3xl font-bold text-gray-900'>
						¿Olvidaste tu contraseña?
					</Text>

					<Text className='mt-2 text-base leading-6 text-gray-500'>
						Ingresa tu correo electrónico y te enviaremos instrucciones para
						recuperar el acceso a tu cuenta.
					</Text>
				</View>

				<View className='mt-9'>
					<Text className='mb-2 ml-1 text-sm font-semibold text-gray-700'>
						Correo electrónico
					</Text>

					<TextInput
						className='rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-base text-gray-900'
						placeholder='correo@ejemplo.com'
						placeholderTextColor='#9ca3af'
						value={email}
						onChangeText={setEmail}
						autoCapitalize='none'
						autoCorrect={false}
						keyboardType='email-address'
						autoComplete='email'
						returnKeyType='done'
						onSubmitEditing={handleRecover}
					/>

					<Pressable
						className='mt-7 items-center rounded-full bg-emerald-700 py-5'
						onPress={handleRecover}
					>
						<Text className='text-base font-bold text-white'>
							Enviar instrucciones
						</Text>
					</Pressable>
				</View>

				<View className='mt-8 flex-row items-center justify-center'>
					<Text className='text-gray-500'>¿Recuerdas tu contraseña?</Text>

					<Pressable
						className='ml-2 rounded-full px-2 py-1'
						onPress={() => router.replace('/login')}
					>
						<Text className='font-bold text-emerald-700'>Iniciar sesión</Text>
					</Pressable>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
