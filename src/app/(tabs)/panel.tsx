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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import ActionButton from '@/components/ActionButton'
import AppCard from '@/components/AppCard'
import UserHeader from '@/components/UserHeader'
import { api } from '@/services/api'
import { getToken, logout, type User } from '@/services/auth'
import colors from '@/theme/colors'
import { getTabBarExtraSpace } from '@/theme/layout'
import { cardShadow } from '@/theme/shadows'
import type { ProfileResponse } from '@/types/user'

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
	const insets = useSafeAreaInsets()

	const [loggingOut, setLoggingOut] = useState(false)
	const [user, setUser] = useState<User | null>(null)
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
				className='flex-1 bg-blanco'
				resizeMode='repeat'
				imageClassName='opacity-[0.025]'
			>
				<ScrollView
					className='flex-1'
					contentContainerClassName='px-3 pt-2'
					contentContainerStyle={{
						paddingBottom: 120 + getTabBarExtraSpace(insets.bottom),
					}}
					showsVerticalScrollIndicator={false}
				>
					{/* ENCABEZADO */}

					<UserHeader title='Panel' subtitle='Tu espacio personal en ZooApp.' />

					{/* TARJETA DE PERFIL */}

					<View className='mt-5'>
						<AppCard
							avatarUrl={avatarUrl}
							title={user?.name ?? 'Mi cuenta'}
							description={user?.email ?? 'Consulta tus datos personales'}
							onPress={() => router.push('/profile')}
							showArrow
						/>
					</View>

					{/* MI CUENTA */}

					<View className='mt-6'>
						<Text className='mb-3.5 px-1 text-lg font-bold leading-6 text-tinta'>
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

					<View className='mt-4'>
						<Text className='mb-3.5 px-1 text-lg font-bold leading-6 text-tinta'>
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

					<View className='mt-4'>
						<Text className='mb-3.5 px-1 text-lg font-bold leading-6 text-tinta'>
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
						className='mt-4 overflow-hidden rounded-[18px] border border-card-border bg-niebla'
						style={cardShadow}
					>
						<Pressable
							onPress={handleLogout}
							disabled={loggingOut}
							className='min-h-20 flex-row items-center px-3 py-2.5 active:opacity-[0.84]'
						>
							<View className='h-11 w-11 items-center justify-center rounded-[16px] border border-card-border bg-hoja'>
								<HugeiconsIcon
									icon={Logout01Icon}
									size={23}
									strokeWidth={1.8}
									color={colors.esmeralda}
								/>
							</View>

							<View className='ml-2.5 flex-1'>
								<Text className='text-sm font-extrabold text-tinta'>
									{loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
								</Text>

								<Text className='mt-1 text-xs text-tinta'>
									Salir de tu cuenta
								</Text>
							</View>

							{loggingOut ? (
								<ActivityIndicator size='small' color={colors.esmeralda} />
							) : (
								<View className='ml-2 h-7 w-7 items-center justify-center rounded-full bg-esmeralda'>
									<HugeiconsIcon
										icon={ArrowRight01Icon}
										size={20}
										strokeWidth={2}
										color={colors.blanco}
									/>
								</View>
							)}
						</Pressable>
					</View>

					{/* PIE DE PÁGINA */}

					<View className='mt-7 items-center'>
						<Text className='text-[11px] font-extrabold leading-4 text-tinta'>
							ZooApp
						</Text>

						<Text className='mt-1 text-[11px] leading-4 text-tinta'>
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

					<View className='flex-1 items-center justify-center bg-bosque/55 px-6 py-5'>
						{/* Modal */}

						<View
							className='w-full max-w-[380px] rounded-3xl border border-card-border bg-blanco p-5'
							style={cardShadow}
						>
							{/* ENCABEZADO */}

							<View className='items-center'>
								<View className='h-11 w-11 items-center justify-center rounded-[14px] border border-card-border bg-hoja'>
									<HugeiconsIcon
										icon={QrCodeIcon}
										size={26}
										strokeWidth={1.8}
										color={colors.esmeralda}
									/>
								</View>

								<Text className='mt-2.5 text-center text-[22px] font-extrabold text-tinta'>
									Mi código QR
								</Text>

								<Text className='mt-1 text-center text-[13px] leading-[19px] text-tinta'>
									Presenta este código en taquilla para identificar tu cuenta.
								</Text>
							</View>

							{/* CÓDIGO QR */}

							<View
								className='mt-[18px] self-center rounded-3xl border border-card-border bg-blanco p-3'
								style={cardShadow}
							>
								{user?.qr_token ? (
									<QRCode
										value={user.qr_token}
										size={180}
										backgroundColor={colors.blanco}
										color={colors.bosque}
									/>
								) : (
									<View className='h-[180px] w-[180px] items-center justify-center bg-blanco'>
										<ActivityIndicator size='large' color={colors.esmeralda} />
									</View>
								)}
							</View>

							{/* INFORMACIÓN */}

							<View className='mt-3.5 rounded-xl border border-card-border bg-niebla p-2.5'>
								<Text className='text-xs font-extrabold text-tinta'>
									Código personal
								</Text>

								<Text className='mt-1 text-[11px] leading-[18px] text-tinta'>
									Este código está asociado a tu cuenta de ZooApp.
								</Text>
							</View>

							{/* BOTÓN CERRAR */}

							<View className='mt-3.5'>
								<ActionButton title='Cerrar' onPress={() => setShowQr(false)} />
							</View>
						</View>
					</View>
				</Modal>
			</ImageBackground>
		</SafeAreaView>
	)
}
