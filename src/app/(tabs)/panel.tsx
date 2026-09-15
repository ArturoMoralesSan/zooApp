import {
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
	Modal,
	Pressable,
	ScrollView,
	Text,
	View,
} from 'react-native'
import QRCode from 'react-native-qrcode-svg'

import { getCurrentUser, logout, type User } from '@/services/auth'

type MenuItemProps = {
	icon: typeof UserIcon
	title: string
	description: string
	onPress: () => void
}

function MenuItem({ icon, title, description, onPress }: MenuItemProps) {
	return (
		<Pressable
			onPress={onPress}
			className='mb-3 flex-row items-center rounded-2xl bg-white px-4 py-4'
			style={({ pressed }) => ({
				opacity: pressed ? 0.7 : 1,
			})}
		>
			<View className='h-11 w-11 items-center justify-center rounded-xl bg-emerald-50'>
				<HugeiconsIcon icon={icon} size={23} color='#047857' />
			</View>

			<View className='ml-4 flex-1'>
				<Text className='text-base font-bold text-gray-900'>{title}</Text>

				<Text className='mt-1 text-sm text-gray-500'>{description}</Text>
			</View>

			<Text className='text-2xl text-gray-300'>›</Text>
		</Pressable>
	)
}

export default function Panel() {
	const [loggingOut, setLoggingOut] = useState(false)
	const [loadingUser, setLoadingUser] = useState(true)
	const [user, setUser] = useState<User | null>(null)
	const [showQr, setShowQr] = useState(false)

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

	return (
		<View className='flex-1 bg-gray-50'>
			<ScrollView
				className='flex-1'
				contentContainerStyle={{
					paddingHorizontal: 20,
					paddingTop: 55,
					paddingBottom: 120,
				}}
			>
				<Text className='text-3xl font-bold text-gray-900'>Panel</Text>

				<Text className='mt-2 text-base text-gray-500'>
					Administra tu cuenta y tus beneficios.
				</Text>

				<View className='mt-7'>
					<Text className='mb-3 px-1 text-sm font-bold uppercase tracking-wide text-gray-400'>
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

				<View className='mt-5'>
					<Text className='mb-3 px-1 text-sm font-bold uppercase tracking-wide text-gray-400'>
						Mi actividad
					</Text>

					<MenuItem
						icon={Ticket01Icon}
						title='Mis entradas'
						description='Consulta tus entradas al zoológico'
						onPress={() =>
							Alert.alert(
								'Mis entradas',
								'Esta sección estará disponible próximamente.',
							)
						}
					/>

					<MenuItem
						icon={Ticket01Icon}
						title='Mis donaciones'
						description='Consulta tus donaciones'
						onPress={() =>
							Alert.alert(
								'Mis donaciones',
								'Esta sección estará disponible próximamente.',
							)
						}
					/>
				</View>

				<View className='mt-5'>
					<Text className='mb-3 px-1 text-sm font-bold uppercase tracking-wide text-gray-400'>
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

				<View className='mt-5'>
					<Pressable
						onPress={handleLogout}
						disabled={loggingOut}
						className='flex-row items-center rounded-2xl bg-white px-4 py-4'
						style={({ pressed }) => ({
							opacity: pressed ? 0.7 : 1,
						})}
					>
						<View className='h-11 w-11 items-center justify-center rounded-xl bg-red-50'>
							<HugeiconsIcon icon={Logout01Icon} size={23} color='#dc2626' />
						</View>

						<View className='ml-4 flex-1'>
							<Text className='text-base font-bold text-red-600'>
								{loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
							</Text>

							<Text className='mt-1 text-sm text-gray-500'>
								Salir de tu cuenta
							</Text>
						</View>

						{loggingOut && <ActivityIndicator size='small' color='#dc2626' />}
					</Pressable>
				</View>

				<View className='mt-8 items-center'>
					<Text className='text-xs text-gray-400'>ZooApp</Text>

					<Text className='mt-1 text-xs text-gray-300'>Sahuatoba</Text>
				</View>
			</ScrollView>

			{/* Modal del código QR */}
			<Modal
				visible={showQr}
				transparent
				animationType='fade'
				onRequestClose={() => setShowQr(false)}
			>
				<View
					style={{
						flex: 1,
						backgroundColor: 'rgba(0,0,0,0.45)',
						alignItems: 'center',
						justifyContent: 'center',
						paddingHorizontal: 24,
					}}
				>
					<View
						className='w-full rounded-3xl bg-white px-6 py-7'
						style={{
							maxWidth: 400,
						}}
					>
						{/* Encabezado */}
						<View className='items-center'>
							<View className='h-14 w-14 items-center justify-center rounded-full bg-emerald-100'>
								<HugeiconsIcon icon={QrCodeIcon} size={28} color='#047857' />
							</View>

							<Text className='mt-4 text-2xl font-bold text-gray-900'>
								Mi código QR
							</Text>

							<Text className='mt-2 text-center text-sm leading-5 text-gray-500'>
								Presenta este código en taquilla para identificar tu cuenta y
								acumular tus beneficios.
							</Text>
						</View>

						{/* QR */}
						<View className='mt-6 items-center'>
							<View
								className='rounded-2xl border border-gray-100 bg-white p-4'
								style={{
									shadowColor: '#000',
									shadowOffset: {
										width: 0,
										height: 3,
									},
									shadowOpacity: 0.08,
									shadowRadius: 8,
									elevation: 4,
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
										<ActivityIndicator size='large' color='#047857' />
									</View>
								)}
							</View>
						</View>

						{/* Información */}
						<View className='mt-6 rounded-2xl bg-emerald-50 px-4 py-4'>
							<Text className='text-center text-sm font-semibold text-emerald-800'>
								Código personal
							</Text>

							<Text className='mt-1 text-center text-xs leading-5 text-emerald-700'>
								Este código está asociado permanentemente a tu cuenta de ZooApp.
							</Text>
						</View>

						{/* Cerrar */}
						<Pressable
							onPress={() => setShowQr(false)}
							className='mt-6 items-center rounded-full bg-emerald-700 px-5 py-4'
							style={({ pressed }) => ({
								opacity: pressed ? 0.75 : 1,
							})}
						>
							<Text className='text-base font-bold text-white'>Cerrar</Text>
						</Pressable>
					</View>
				</View>
			</Modal>
		</View>
	)
}
