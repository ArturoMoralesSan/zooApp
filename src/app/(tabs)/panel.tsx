import {
	ArrowRight01Icon,
	HelpCircleIcon,
	Logout01Icon,
	QrCodeIcon,
	Settings01Icon,
	Ticket01Icon,
	UserIcon,
} from '@hugeicons/core-free-icons'

import { getCurrentUser, logout, type User } from '@/services/auth'
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

/* -------------------------------------------------------------------------- */
/*                                   COLORS                                   */
/* -------------------------------------------------------------------------- */

const colors = {
	/* Background */
	background: '#F7F9F8',

	/* Primary */
	primary: '#075C3B',
	primaryLight: '#16845D',

	/* Cards */
	card: '#DDF5EA',
	cardLight: '#E8F7F0',
	active: '#BDEED9',

	/* Text */
	text: '#17372C',
	textSecondary: '#557067',

	/* Borders */
	border: '#B8E6D3',

	/* Base */
	white: '#FFFFFF',

	/* Accent */
	coral: '#D95C4F',

	/* Error */
	errorBackground: '#FFF3F1',
	errorBorder: '#F3D5D0',
	errorText: '#8C4037',

	/* Map / special */
	mapBackground: '#F8E1DE',
	mapBorder: '#EFC2BC',

	/* Overlay */
	overlay: 'rgba(0,0,0,0.45)',
}

/* -------------------------------------------------------------------------- */
/*                                   SHADOW                                   */
/* -------------------------------------------------------------------------- */

const cardShadow = {
	shadowColor: '#075C3B',
	shadowOffset: {
		width: 0,
		height: 5,
	},
	shadowOpacity: 0.12,
	shadowRadius: 10,
	elevation: 4,
}

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

type MenuItemProps = {
	icon: typeof UserIcon
	title: string
	description: string
	onPress: () => void
}

/* -------------------------------------------------------------------------- */
/*                                 MENU ITEM                                  */
/* -------------------------------------------------------------------------- */

function MenuItem({ icon, title, description, onPress }: MenuItemProps) {
	return (
		<View
			className='mb-4 overflow-hidden rounded-[28px]'
			style={{
				backgroundColor: colors.card,
				borderWidth: 1,
				borderColor: colors.border,
				...cardShadow,
			}}
		>
			<Pressable
				onPress={onPress}
				className='flex-row items-center rounded-[28px] px-5 py-4'
				style={({ pressed }) => ({
					backgroundColor: colors.card,
					opacity: pressed ? 0.96 : 1,
					transform: [
						{
							scale: pressed ? 0.99 : 1,
						},
					],
				})}
			>
				{/* Icono */}
				<View
					className='h-12 w-12 items-center justify-center rounded-[16px]'
					style={{
						backgroundColor: colors.active,
						borderWidth: 1,
						borderColor: colors.border,
					}}
				>
					<HugeiconsIcon
						icon={icon}
						size={25}
						strokeWidth={1.8}
						color={colors.primary}
					/>
				</View>

				{/* Información */}
				<View className='ml-4 flex-1'>
					<Text
						className='text-base font-bold'
						style={{
							color: colors.text,
						}}
					>
						{title}
					</Text>

					<Text
						className='mt-1 text-sm leading-5'
						style={{
							color: colors.textSecondary,
						}}
					>
						{description}
					</Text>
				</View>

				{/* Flecha */}
				<HugeiconsIcon
					icon={ArrowRight01Icon}
					size={22}
					strokeWidth={1.8}
					color='#7DA996'
				/>
			</Pressable>
		</View>
	)
}

/* -------------------------------------------------------------------------- */
/*                                  COMPONENT                                 */
/* -------------------------------------------------------------------------- */

export default function Panel() {
	const [loggingOut, setLoggingOut] = useState(false)
	const [loadingUser, setLoadingUser] = useState(true)
	const [user, setUser] = useState<User | null>(null)
	const [showQr, setShowQr] = useState(false)

	/* ---------------------------------------------------------------------- */
	/*                              LOAD USER                                 */
	/* ---------------------------------------------------------------------- */

	useEffect(() => {
		const loadUser = async () => {
			try {
				const currentUser = await getCurrentUser()
				setUser(currentUser)
			} catch {
				setUser(null)
			} finally {
				setLoadingUser(false)
			}
		}

		void loadUser()
	}, [])

	/* ---------------------------------------------------------------------- */
	/*                               QR                                        */
	/* ---------------------------------------------------------------------- */

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

	/* ---------------------------------------------------------------------- */
	/*                              LOGOUT                                     */
	/* ---------------------------------------------------------------------- */

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

	/* ---------------------------------------------------------------------- */
	/*                                  RETURN                                 */
	/* ---------------------------------------------------------------------- */

	return (
		<ImageBackground
			source={require('@/assets/images/zoo-pattern.png')}
			className='flex-1'
			resizeMode='repeat'
			imageStyle={{
				opacity: 0.3,
			}}
			style={{
				backgroundColor: colors.background,
			}}
		>
			<ScrollView
				className='flex-1'
				contentContainerStyle={{
					paddingHorizontal: 20,
					paddingTop: 55,
					paddingBottom: 120,
				}}
				showsVerticalScrollIndicator={false}
			>
				{/* ========================================================== */}
				{/*                              HEADER                         */}
				{/* ========================================================== */}

				<View>
					<Text
						className='text-3xl font-bold'
						style={{
							color: colors.primary,
						}}
					>
						Panel
					</Text>

					<Text
						className='mt-2 text-base'
						style={{
							color: colors.textSecondary,
						}}
					>
						Administra tu cuenta y tus beneficios.
					</Text>
				</View>

				{/* ========================================================== */}
				{/*                            MI CUENTA                        */}
				{/* ========================================================== */}

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
						icon={UserIcon}
						title='Mi perfil'
						description='Datos personales y foto de perfil'
						onPress={() => router.push('/profile')}
					/>

					<MenuItem
						icon={QrCodeIcon}
						title='Mi código QR'
						description='Consulta tu código personal'
						onPress={handleShowQr}
					/>
				</View>

				{/* ========================================================== */}
				{/*                           MI ACTIVIDAD                      */}
				{/* ========================================================== */}

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

				{/* ========================================================== */}
				{/*                               AYUDA                        */}
				{/* ========================================================== */}

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

				{/* ========================================================== */}
				{/*                         CERRAR SESIÓN                      */}
				{/* ========================================================== */}

				<View className='mt-5 overflow-hidden rounded-[28px]'>
					<Pressable
						onPress={handleLogout}
						disabled={loggingOut}
						className='flex-row items-center rounded-[28px] px-5 py-4'
						style={({ pressed }) => ({
							backgroundColor: colors.errorBackground,
							borderWidth: 1,
							borderColor: colors.errorBorder,
							opacity: pressed ? 0.96 : 1,
							transform: [
								{
									scale: pressed ? 0.99 : 1,
								},
							],
							...cardShadow,
						})}
					>
						{/* Icono */}
						<View
							className='h-12 w-12 items-center justify-center rounded-[16px]'
							style={{
								backgroundColor: '#FFE5E1',
								borderWidth: 1,
								borderColor: '#F4D2CD',
							}}
						>
							<HugeiconsIcon
								icon={Logout01Icon}
								size={23}
								strokeWidth={1.8}
								color={colors.coral}
							/>
						</View>

						{/* Información */}
						<View className='ml-4 flex-1'>
							<Text
								className='text-base font-bold'
								style={{
									color: colors.coral,
								}}
							>
								{loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
							</Text>

							<Text
								className='mt-1 text-sm leading-5'
								style={{
									color: colors.textSecondary,
								}}
							>
								Salir de tu cuenta
							</Text>
						</View>

						{loggingOut && (
							<ActivityIndicator size='small' color={colors.coral} />
						)}
					</Pressable>
				</View>

				{/* ========================================================== */}
				{/*                              FOOTER                         */}
				{/* ========================================================== */}

				<View className='mt-8 items-center'>
					<Text
						className='text-xs'
						style={{
							color: colors.textSecondary,
						}}
					>
						ZooApp
					</Text>

					<Text
						className='mt-1 text-xs'
						style={{
							color: '#7DA996',
						}}
					>
						Sahuatoba
					</Text>
				</View>
			</ScrollView>

			{/* ============================================================== */}
			{/*                              MODAL QR                           */}
			{/* ============================================================== */}

			<Modal
				visible={showQr}
				transparent
				animationType='fade'
				onRequestClose={() => setShowQr(false)}
			>
				<View
					style={{
						flex: 1,
						backgroundColor: colors.overlay,
						alignItems: 'center',
						justifyContent: 'center',
						paddingHorizontal: 24,
					}}
				>
					<View
						className='w-full overflow-hidden rounded-[28px] px-6 py-7'
						style={{
							maxWidth: 400,
							backgroundColor: colors.cardLight,
							borderWidth: 1,
							borderColor: colors.border,
							...cardShadow,
						}}
					>
						{/* Encabezado */}
						<View className='items-center'>
							<View
								className='h-14 w-14 items-center justify-center rounded-[16px]'
								style={{
									backgroundColor: colors.active,
									borderWidth: 1,
									borderColor: colors.border,
								}}
							>
								<HugeiconsIcon
									icon={QrCodeIcon}
									size={28}
									strokeWidth={1.8}
									color={colors.primary}
								/>
							</View>

							<Text
								className='mt-4 text-2xl font-bold'
								style={{
									color: colors.text,
								}}
							>
								Mi código QR
							</Text>

							<Text
								className='mt-2 text-center text-sm leading-5'
								style={{
									color: colors.textSecondary,
								}}
							>
								Presenta este código en taquilla para identificar tu cuenta y
								acumular tus beneficios.
							</Text>
						</View>

						{/* QR */}
						<View className='mt-6 items-center'>
							<View
								className='rounded-[24px] p-4'
								style={{
									backgroundColor: colors.white,
									borderWidth: 1,
									borderColor: colors.border,
									...cardShadow,
								}}
							>
								{user?.qr_token ? (
									<QRCode
										value={user.qr_token}
										size={240}
										backgroundColor='#ffffff'
										color='#000000'
										eQuietZone={4}
									/>
								) : (
									<View
										style={{
											width: 240,
											height: 240,
											alignItems: 'center',
											justifyContent: 'center',
										}}
									>
										<ActivityIndicator size='large' color={colors.primary} />
									</View>
								)}
							</View>
						</View>

						{/* Información */}
						<View
							className='mt-6 rounded-[20px] px-4 py-4'
							style={{
								backgroundColor: colors.active,
								borderWidth: 1,
								borderColor: colors.border,
							}}
						>
							<Text
								className='text-center text-sm font-bold'
								style={{
									color: colors.primary,
								}}
							>
								Código personal
							</Text>

							<Text
								className='mt-1 text-center text-xs leading-5'
								style={{
									color: colors.textSecondary,
								}}
							>
								Este código está asociado permanentemente a tu cuenta de ZooApp.
							</Text>
						</View>

						{/* Cerrar */}
						<Pressable
							onPress={() => setShowQr(false)}
							className='mt-6 w-full items-center justify-center rounded-[20px] bg-[#075C3B] px-5 py-4'
							style={({ pressed }) => ({
								opacity: pressed ? 0.9 : 1,
								transform: [
									{
										scale: pressed ? 0.98 : 1,
									},
								],
							})}
						>
							<Text className='text-base font-bold text-white'>Cerrar</Text>
						</Pressable>
					</View>
				</View>
			</Modal>
		</ImageBackground>
	)
}
