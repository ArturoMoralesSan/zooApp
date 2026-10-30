import {
	HeartIcon,
	HelpCircleIcon,
	QrCodeIcon,
	Settings01Icon,
	Ticket01Icon,
} from '@hugeicons/core-free-icons'
import { router } from 'expo-router'
import { useState } from 'react'

import { Alert, ScrollView, Text, View } from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ListCard } from '@/components/ui/ListCard'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { TabHeader } from '@/components/ui/TabHeader'
import { useProfile } from '@/hooks/useProfile'
import { useSessionRedirect } from '@/hooks/useSessionRedirect'
import { useAuth } from '@/contexts/AuthContext'
import { getTabBarExtraSpace } from '@/theme/layout'
import { ScreenBackground } from '@/components/ui/ScreenBackground'
import { LogoutCard } from '@/components/panel/LogoutCard'
import { PanelQrModal } from '@/components/panel/PanelQrModal'
import { getInitials } from '@/utils/profile'

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

	const { logout } = useAuth()

	const [loggingOut, setLoggingOut] = useState(false)
	const [showQr, setShowQr] = useState(false)

	const { data: profile, error: profileError } = useProfile()
	// On a failed load the panel falls back to its generic texts, as before.
	const user = profileError ? null : (profile ?? null)

	useSessionRedirect()

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
		<ScreenBackground withSafeAreaBackground={false}>
			<ScrollView
				className='flex-1'
				contentContainerClassName='px-3 pt-2'
				contentContainerStyle={{
					paddingBottom: 120 + getTabBarExtraSpace(insets.bottom),
				}}
				showsVerticalScrollIndicator={false}
			>
				{/* ENCABEZADO */}

				<TabHeader title='Panel' subtitle='Tu espacio personal en ZooApp.' />

				{/* TARJETA DE PERFIL */}

				<View className='mt-5'>
					<ListCard
						className='mb-3'
						avatarUrl={avatarUrl}
						avatarInitials={getInitials(user?.name)}
						title={user?.name ?? 'Mi cuenta'}
						description={user?.email ?? 'Consulta tus datos personales'}
						onPress={() => router.push('/profile')}
						showChevron
					/>
				</View>

				{/* MI CUENTA */}

				<View className='mt-6'>
					<SectionTitle title='Mi cuenta' />

					<ListCard
						className='mb-3'
						icon={QrCodeIcon}
						title='Mi código QR'
						description='Consulta tu código personal'
						onPress={handleShowQr}
					/>
				</View>

				{/* MI ACTIVIDAD */}

				<View className='mt-6'>
					<SectionTitle title='Mi actividad' />

					<ListCard
						className='mb-3'
						icon={Ticket01Icon}
						title='Mis entradas'
						description='Consulta tus entradas al zoológico'
						onPress={() => router.push('/tickets/my-tickets')}
					/>

					<ListCard
						className='mb-3'
						icon={HeartIcon}
						title='Mis donaciones'
						description='Consulta tus donaciones'
						onPress={() => router.push('/donations/history')}
					/>
				</View>

				{/* AYUDA */}

				<View className='mt-6'>
					<SectionTitle title='Ayuda' />

					<ListCard
						className='mb-3'
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

					<ListCard
						className='mb-3'
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

				<LogoutCard loggingOut={loggingOut} onLogout={handleLogout} />

				{/* PIE DE PÁGINA */}

				<View className='mt-7 items-center'>
					<Text className='font-sans-x text-[12px] text-tinta'>ZooApp</Text>

					<Text className='text-meta mt-1 text-tinta'>Sahuatoba</Text>
				</View>
			</ScrollView>

			{/* MODAL DEL CÓDIGO QR */}

			<PanelQrModal
				visible={showQr}
				user={user}
				onClose={() => setShowQr(false)}
			/>
		</ScreenBackground>
	)
}
