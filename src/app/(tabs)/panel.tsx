import {
	ArrowRight01Icon,
	HelpCircleIcon,
	Logout01Icon,
	QrCodeIcon,
	Settings01Icon,
	Ticket01Icon,
	UserIcon,
} from '@hugeicons/core-free-icons'

import { HugeiconsIcon } from '@hugeicons/react-native'

import { router } from 'expo-router'

import { useEffect, useState } from 'react'

import {
	ActivityIndicator,
	Alert,
	Image,
	ImageBackground,
	Modal,
	Pressable,
	ScrollView,
	Text,
	View,
} from 'react-native'

import QRCode from 'react-native-qrcode-svg'

import { SafeAreaView } from 'react-native-safe-area-context'

import UserHeader from '@/components/UserHeader'

import { API_URL, api } from '@/services/api'

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
	menuArrowStyle,
	menuDescriptionStyle,
	menuIconContainerStyle,
	menuItemContainerStyle,
	menuItemStyle,
	menuTitleStyle,
	modalOverlayStyle,
	profileAvatarPlaceholderStyle,
	profileContainerStyle,
	profileNameStyle,
	profileViewProfileStyle,
	qrCloseStyle,
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

type MenuItemProps = {
	icon: typeof UserIcon
	title: string
	description: string
	onPress: () => void
}

type UserWithProfile = User & {
	profile?: {
		avatar?: string | null
	}
}

type ProfileResponse = {
	success: boolean
	user: UserWithProfile
}

function getAvatarUrl(avatar: string | null | undefined): string | null {
	if (!avatar) {
		return null
	}

	if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
		return avatar
	}

	const baseUrl = API_URL.replace(/\/api\/?$/, '')

	return `${baseUrl}/storage/${avatar}`
}

function MenuItem({ icon, title, description, onPress }: MenuItemProps) {
	return (
		<View
			className='mb-4 overflow-hidden rounded-[28px]'
			style={menuItemContainerStyle}
		>
			<Pressable
				onPress={onPress}
				className='flex-row items-center rounded-[28px] px-5 py-4'
				style={({ pressed }) => menuItemStyle(pressed)}
			>
				<View
					className='h-12 w-12 items-center justify-center rounded-[16px]'
					style={menuIconContainerStyle}
				>
					<HugeiconsIcon
						icon={icon}
						size={25}
						strokeWidth={1.8}
						color={colors.primary}
					/>
				</View>

				<View className='ml-4 flex-1'>
					<Text className='text-base font-bold' style={menuTitleStyle}>
						{title}
					</Text>

					<Text className='mt-1 text-sm leading-5' style={menuDescriptionStyle}>
						{description}
					</Text>
				</View>

				<HugeiconsIcon
					icon={ArrowRight01Icon}
					size={22}
					strokeWidth={1.8}
					color={menuArrowStyle.color as string}
				/>
			</Pressable>
		</View>
	)
}

export default function Panel() {
	const [loggingOut, setLoggingOut] = useState(false)

	const [loadingUser, setLoadingUser] = useState(true)

	const [user, setUser] = useState<UserWithProfile | null>(null)

	const [showQr, setShowQr] = useState(false)

	useEffect(() => {
		const loadProfile = async () => {
			try {
				setLoadingUser(true)

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

				setUser(response.user)
			} catch (error) {
				console.error('LOAD PANEL PROFILE ERROR:', error)

				setUser(null)
			} finally {
				setLoadingUser(false)
			}
		}

		void loadProfile()
	}, [])

	const handleShowQr = () => {
		if (loadingUser) {
			return
		}

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
					{/* HEADER */}

					<UserHeader title='Panel' />

					{/* PERFIL */}

					<Pressable
						onPress={() => router.push('/profile')}
						className='mt-7 items-center'
						style={profileContainerStyle}
					>
						{loadingUser ? (
							<View
								className='h-24 w-24 items-center justify-center rounded-full'
								style={profileAvatarPlaceholderStyle}
							>
								<ActivityIndicator size='small' color={colors.primary} />
							</View>
						) : avatarUrl ? (
							<Image
								source={{
									uri: avatarUrl,
								}}
								className='h-24 w-24 rounded-full'
								resizeMode='cover'
								onError={(error) => {
									console.error('PROFILE AVATAR ERROR:', error.nativeEvent)
								}}
							/>
						) : (
							<View
								className='h-24 w-24 items-center justify-center rounded-full'
								style={profileAvatarPlaceholderStyle}
							>
								<HugeiconsIcon
									icon={UserIcon}
									size={42}
									strokeWidth={1.7}
									color={colors.primary}
								/>
							</View>
						)}

						<Text
							className='mt-4 text-2xl font-bold'
							style={profileNameStyle}
							numberOfLines={1}
						>
							{user?.name ?? 'Usuario'}
						</Text>

						<Text
							className='mt-1 text-sm font-semibold'
							style={profileViewProfileStyle}
						>
							Ver perfil
						</Text>
					</Pressable>

					{/* MI CUENTA */}

					<View className='mt-7'>
						<Text
							className='mb-4 px-1 text-xl font-bold'
							style={{
								color: colors.text,
							}}
						>
							Mi cuenta
						</Text>

						<MenuItem
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
							style={{
								color: colors.text,
							}}
						>
							Mi actividad
						</Text>

						<MenuItem
							icon={Ticket01Icon}
							title='Mis entradas'
							description='Consulta tus entradas al zoológico'
							onPress={() => router.push('/tickets/my-tickets')}
						/>

						<MenuItem
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
							style={{
								color: colors.text,
							}}
						>
							Ayuda
						</Text>

						<MenuItem
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

						<MenuItem
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

					<View className='mt-5 overflow-hidden rounded-[28px]'>
						<Pressable
							onPress={handleLogout}
							disabled={loggingOut}
							className='flex-row items-center rounded-[28px] px-5 py-4'
							style={({ pressed }) => ({
								...logoutContainerStyle,
								...logoutPressableStyle(pressed),
							})}
						>
							<View
								className='h-12 w-12 items-center justify-center rounded-[16px]'
								style={logoutIconContainerStyle}
							>
								<HugeiconsIcon
									icon={Logout01Icon}
									size={23}
									strokeWidth={1.8}
									color={colors.coral}
								/>
							</View>

							<View className='ml-4 flex-1'>
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

							{loggingOut && (
								<ActivityIndicator size='small' color={colors.coral} />
							)}
						</Pressable>
					</View>

					{/* FOOTER */}

					<View className='mt-8 items-center'>
						<Text className='text-xs' style={footerTitleStyle}>
							ZooApp
						</Text>

						<Text className='mt-1 text-xs' style={footerSubtitleStyle}>
							Sahuatoba
						</Text>
					</View>
				</ScrollView>

				{/* MODAL QR */}

				<Modal
					visible={showQr}
					transparent
					animationType='fade'
					onRequestClose={() => setShowQr(false)}
				>
					<View style={modalOverlayStyle}>
						<View
							className='w-full overflow-hidden rounded-[28px] px-6 py-7'
							style={qrModalStyle}
						>
							{/* ENCABEZADO */}

							<View className='items-center'>
								<View
									className='h-14 w-14 items-center justify-center rounded-[16px]'
									style={qrHeaderIconStyle}
								>
									<HugeiconsIcon
										icon={QrCodeIcon}
										size={28}
										strokeWidth={1.8}
										color={colors.primary}
									/>
								</View>

								<Text className='mt-4 text-2xl font-bold' style={qrTitleStyle}>
									Mi código QR
								</Text>

								<Text
									className='mt-2 text-center text-sm leading-5'
									style={qrDescriptionStyle}
								>
									Presenta este código en taquilla para identificar tu cuenta y
									acumular tus beneficios.
								</Text>
							</View>

							{/* QR */}

							<View className='mt-6 items-center'>
								<View className='rounded-[24px] p-4' style={qrContainerStyle}>
									{user?.qr_token ? (
										<QRCode
											value={user.qr_token}
											size={240}
											backgroundColor='#ffffff'
											color='#000000'
											eQuietZone={4}
										/>
									) : (
										<View style={qrLoadingStyle}>
											<ActivityIndicator size='large' color={colors.primary} />
										</View>
									)}
								</View>
							</View>

							{/* INFORMACIÓN */}

							<View
								className='mt-6 rounded-[20px] px-4 py-4'
								style={qrInfoStyle}
							>
								<Text
									className='text-center text-sm font-bold'
									style={qrInfoTitleStyle}
								>
									Código personal
								</Text>

								<Text
									className='mt-1 text-center text-xs leading-5'
									style={qrInfoDescriptionStyle}
								>
									Este código está asociado permanentemente a tu cuenta de
									ZooApp.
								</Text>
							</View>

							{/* CERRAR */}

							<Pressable
								onPress={() => setShowQr(false)}
								className='mt-6 w-full items-center justify-center rounded-[20px] bg-[#075C3B] px-5 py-4'
								style={({ pressed }) => qrCloseStyle(pressed)}
							>
								<Text className='text-base font-bold text-white'>Cerrar</Text>
							</Pressable>
						</View>
					</View>
				</Modal>
			</ImageBackground>
		</SafeAreaView>
	)
}
