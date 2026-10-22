import {
	ArrowRight01Icon,
	HelpCircleIcon,
	Logout01Icon,
	QrCodeIcon,
	Settings01Icon,
	Ticket01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'

import {
	ActivityIndicator,
	Alert,
	ImageBackground,
	Modal,
	Pressable,
	ScrollView,
	Text,
	View,
} from 'react-native'

import QRCode from 'react-native-qrcode-svg'
import { SafeAreaView } from 'react-native-safe-area-context'

import ActionButton from '@/components/ActionButton'
import AppCard from '@/components/AppCard'
import UserHeader from '@/components/UserHeader'
import { api } from '@/services/api'
import { getToken, logout, type User } from '@/services/auth'
import {
	backgroundImageStyle,
	backgroundStyle,
	colors,
	footerSubtitleStyle,
	footerTitleStyle,
	logoutContainerStyle,
	logoutDescriptionStyle,
	logoutIconContainerStyle,
	logoutPressableStyle,
	logoutTitleStyle,
	modalOverlayStyle,
	qrContainerStyle,
	qrDescriptionStyle,
	qrHeaderIconStyle,
	qrInfoDescriptionStyle,
	qrInfoStyle,
	qrInfoTitleStyle,
	qrLoadingStyle,
	qrModalStyle,
	qrTitleStyle,
	scrollContentStyle,
} from '@/styles/panel'

type UserWithProfile = User & {
	profile?: {
		avatar?: string | null
	}
}

type ProfileResponse = {
	success: boolean
	user: UserWithProfile
}

function getAvatarUrl(avatar?: string | null): string | null {
	if (!avatar) return null

	if (avatar.startsWith('https://') || avatar.startsWith('http://')) {
		return avatar
	}

	const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '')

	if (!apiUrl) return null

	const baseUrl = apiUrl.replace(/\/api$/, '')
	const imagePath = avatar.replace(/^\/?storage\//, '').replace(/^\/+/, '')

	return `${baseUrl}/storage/${imagePath}`
}

export default function Panel() {
	const [loggingOut, setLoggingOut] = useState(false)
	const [user, setUser] = useState<UserWithProfile | null>(null)
	const [showQr, setShowQr] = useState(false)

	useEffect(() => {
		let mounted = true

		const loadProfile = async () => {
			try {
				const token = await getToken()

				if (!token) {
					router.replace('/login')
					return
				}

				const response = await api<ProfileResponse>('/profile', {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})

				if (mounted) {
					setUser(response.user)
				}
			} catch (error) {
				console.error('LOAD PANEL PROFILE ERROR:', error)

				if (mounted) {
					setUser(null)
				}
			}
		}

		void loadProfile()

		return () => {
			mounted = false
		}
	}, [])

	const handleShowQr = () => {
		if (!user?.qr_token) {
			Alert.alert('Código QR', 'No fue posible obtener tu código QR.')
			return
		}

		setShowQr(true)
	}

	const handleLogout = () => {
		Alert.alert('Cerrar sesión', '¿Seguro que deseas cerrar sesión?', [
			{
				text: 'Cancelar',
				style: 'cancel',
			},
			{
				text: 'Cerrar sesión',
				style: 'destructive',
				onPress: () => {
					void performLogout()
				},
			},
		])
	}

	const performLogout = async () => {
		try {
			setLoggingOut(true)
			await logout()
			router.replace('/login')
		} catch {
			router.replace('/login')
		} finally {
			setLoggingOut(false)
		}
	}

	const avatarUrl = getAvatarUrl(user?.profile?.avatar)

	return (
		<SafeAreaView className='flex-1' edges={['top', 'left', 'right']}>
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				className='flex-1'
				resizeMode='repeat'
				imageStyle={backgroundImageStyle}
				style={backgroundStyle}
			>
				<ScrollView
					className='flex-1'
					contentContainerStyle={scrollContentStyle}
					showsVerticalScrollIndicator={false}
				>
					{/* ENCABEZADO */}

					<UserHeader title='Panel' subtitle='Tu espacio personal en ZooApp.' />

					{/* TARJETA DE PERFIL */}

					<View className='mt-6'>
						<AppCard
							avatarUrl={avatarUrl}
							title={user?.name ?? 'Mi cuenta'}
							description={user?.email ?? 'Consulta tus datos personales'}
							onPress={() => router.push('/profile')}
							showArrow
						/>
					</View>

					{/* MI CUENTA */}

					<View className='mt-7'>
						<Text
							className='mb-4 px-1 text-xl font-bold'
							style={{ color: '#06371c' }}
						>
							Mi cuenta
						</Text>

						<AppCard
							icon={QrCodeIcon}
							title='Mi código QR'
							description='Consulta tu código personal'
							onPress={handleShowQr}
						/>
					</View>

					{/* MI ACTIVIDAD */}

					<View className='mt-5'>
						<Text
							className='mb-4 px-1 text-xl font-bold'
							style={{ color: '#06371c' }}
						>
							Mi actividad
						</Text>

						<AppCard
							icon={Ticket01Icon}
							title='Mis entradas'
							description='Consulta tus entradas al zoológico'
							onPress={() => router.push('/tickets/my-tickets')}
						/>

						<AppCard
							icon={Ticket01Icon}
							title='Mis donaciones'
							description='Consulta tus donaciones'
							onPress={() => router.push('/donations/history')}
						/>
					</View>

					{/* AYUDA */}

					<View className='mt-5'>
						<Text
							className='mb-4 px-1 text-xl font-bold'
							style={{ color: '#06371c' }}
						>
							Ayuda
						</Text>

						<AppCard
							icon={Settings01Icon}
							title='Configuración'
							description='Preferencias de la aplicación'
							onPress={() =>
								Alert.alert(
									'Configuración',
									'Esta sección estará disponible próximamente.',
								)
							}
						/>

						<AppCard
							icon={HelpCircleIcon}
							title='Ayuda'
							description='Preguntas frecuentes y soporte'
							onPress={() =>
								Alert.alert(
									'Ayuda',
									'Esta sección estará disponible próximamente.',
								)
							}
						/>
					</View>

					{/* CERRAR SESIÓN */}

					<View
						className='mt-5 overflow-hidden rounded-[18px]'
						style={logoutContainerStyle}
					>
						<Pressable
							onPress={handleLogout}
							disabled={loggingOut}
							className='flex-row items-center px-3.5 py-3'
							style={({ pressed }) => [
								logoutPressableStyle(pressed),
								{ minHeight: 80 },
							]}
						>
							<View
								className='h-12 w-12 items-center justify-center rounded-[16px]'
								style={logoutIconContainerStyle}
							>
								<HugeiconsIcon
									icon={Logout01Icon}
									size={23}
									strokeWidth={1.8}
									color='#08783F'
								/>
							</View>

							<View className='ml-3 flex-1'>
								<Text className='text-base font-bold' style={logoutTitleStyle}>
									{loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
								</Text>

								<Text
									className='mt-1 text-sm leading-5'
									style={logoutDescriptionStyle}
								>
									Salir de tu cuenta
								</Text>
							</View>

							{loggingOut ? (
								<ActivityIndicator size='small' color='#08783F' />
							) : (
								<View
									className='ml-2 h-8 w-8 items-center justify-center rounded-full'
									style={{ backgroundColor: '#08783F' }}
								>
									<HugeiconsIcon
										icon={ArrowRight01Icon}
										size={20}
										strokeWidth={2}
										color={colors.white}
									/>
								</View>
							)}
						</Pressable>
					</View>

					{/* PIE DE PÁGINA */}

					<View className='mt-8 items-center'>
						<Text className='text-xs' style={footerTitleStyle}>
							ZooApp
						</Text>

						<Text className='mt-1 text-xs' style={footerSubtitleStyle}>
							Sahuatoba
						</Text>
					</View>
				</ScrollView>

				{/* MODAL DEL CÓDIGO QR */}

				<Modal
					visible={showQr}
					transparent
					animationType='fade'
					statusBarTranslucent
					onRequestClose={() => setShowQr(false)}
				>
					{/* Overlay */}

					<View
						style={[
							modalOverlayStyle,
							{
								backgroundColor: 'rgba(6, 61, 34, 0.55)',
								justifyContent: 'center',
								alignItems: 'center',
								padding: 20,
							},
						]}
					>
						{/* Modal */}

						<View
							style={[
								qrModalStyle,
								{
									backgroundColor: '#FFFFFF',
									width: '100%',
									maxWidth: 380,
									padding: 20,
									borderRadius: 24,
								},
							]}
						>
							{/* ENCABEZADO */}

							<View className='items-center'>
								<View
									className='h-12 w-12 items-center justify-center rounded-[14px]'
									style={[qrHeaderIconStyle, { backgroundColor: '#d5ead9' }]}
								>
									<HugeiconsIcon
										icon={QrCodeIcon}
										size={26}
										strokeWidth={1.8}
										color='#08783F'
									/>
								</View>

								<Text
									className='mt-3 text-center text-[22px]'
									style={[qrTitleStyle, { color: '#06371c' }]}
								>
									Mi código QR
								</Text>

								<Text
									className='mt-1 text-center text-[13px] leading-[19px]'
									style={[qrDescriptionStyle, { color: '#06371c' }]}
								>
									Presenta este código en taquilla para identificar tu cuenta.
								</Text>
							</View>

							{/* CÓDIGO QR */}

							<View
								style={[
									qrContainerStyle,
									{
										alignSelf: 'center',
										marginTop: 18,
										padding: 12,
										backgroundColor: '#FFFFFF',
										borderColor: '#a6c1b3',
									},
								]}
							>
								{user?.qr_token ? (
									<QRCode
										value={user.qr_token}
										size={180}
										backgroundColor='#FFFFFF'
										color='#063D22'
										eQuietZone={4}
									/>
								) : (
									<View
										style={[
											qrLoadingStyle,
											{
												width: 180,
												height: 180,
												alignItems: 'center',
												justifyContent: 'center',
												backgroundColor: '#FFFFFF',
											},
										]}
									>
										<ActivityIndicator size='large' color='#08783F' />
									</View>
								)}
							</View>

							{/* INFORMACIÓN */}

							<View
								className='mt-4 rounded-xl p-3'
								style={[
									qrInfoStyle,
									{
										backgroundColor: '#eef4f0',
										borderWidth: 1,
										borderColor: '#a6c1b3',
									},
								]}
							>
								<Text
									className='text-sm font-extrabold'
									style={[qrInfoTitleStyle, { color: '#06371c' }]}
								>
									Código personal
								</Text>

								<Text
									className='mt-1 text-xs leading-[18px]'
									style={[qrInfoDescriptionStyle, { color: '#06371c' }]}
								>
									Este código está asociado a tu cuenta de ZooApp.
								</Text>
							</View>

							{/* BOTÓN CERRAR */}

							<View className='mt-4'>
								<ActionButton title='Cerrar' onPress={() => setShowQr(false)} />
							</View>
						</View>
					</View>
				</Modal>
			</ImageBackground>
		</SafeAreaView>
	)
}
