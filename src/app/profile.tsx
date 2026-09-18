import Toast from '@/components/toast'
import { API_URL, ApiValidationError, api } from '@/services/api'
import { getToken, type User } from '@/services/auth'
import {
	Calendar03Icon,
	Call02Icon,
	Globe02Icon,
	Location01Icon,
	Mail01Icon,
	UserIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Animated,
	Image,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	Text,
	TextInput,
	View,
} from 'react-native'

type FormErrors = {
	name?: string
	email?: string
	phone?: string
	birth_date?: string
	city?: string
	country?: string
}

type ProfileResponse = {
	success: boolean
	user: User
}

type UpdateProfileResponse = {
	success: boolean
	message: string
	user: User
}

type AvatarResponse = {
	success: boolean
	message: string
	avatar: string
	user: User
}

type ToastState = {
	visible: boolean
	message: string
	type: 'success' | 'error' | 'warning'
}

function formatDateForApp(date: string | null | undefined): string {
	if (!date) {
		return ''
	}

	const parts = date.split('-')

	if (parts.length !== 3) {
		return ''
	}

	const [year, month, day] = parts

	return `${day}-${month}-${year}`
}

function formatDateForApi(date: string): string | null {
	if (!date.trim()) {
		return null
	}

	const parts = date.split('-')

	if (parts.length !== 3) {
		return null
	}

	const [day, month, year] = parts

	if (day.length !== 2 || month.length !== 2 || year.length !== 4) {
		return null
	}

	return `${year}-${month}-${day}`
}

function parseApiDate(date: string | null | undefined): Date {
	if (!date) {
		return new Date(2000, 0, 1)
	}

	const parts = date.split('-')

	if (parts.length !== 3) {
		return new Date(2000, 0, 1)
	}

	const year = Number(parts[0])
	const month = Number(parts[1])
	const day = Number(parts[2])

	if (
		!Number.isInteger(year) ||
		!Number.isInteger(month) ||
		!Number.isInteger(day)
	) {
		return new Date(2000, 0, 1)
	}

	return new Date(year, month - 1, day)
}

function formatDateForDisplay(date: Date): string {
	const day = String(date.getDate()).padStart(2, '0')
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const year = date.getFullYear()

	return `${day}-${month}-${year}`
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

export default function ProfileScreen() {
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [uploadingAvatar, setUploadingAvatar] = useState(false)

	const [user, setUser] = useState<User | null>(null)

	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [phone, setPhone] = useState('')
	const [birthDate, setBirthDate] = useState('')
	const [city, setCity] = useState('')
	const [country, setCountry] = useState('')

	const [showDatePicker, setShowDatePicker] = useState(false)
	const [errors, setErrors] = useState<FormErrors>({})

	const [toast, setToast] = useState<ToastState>({
		visible: false,
		message: '',
		type: 'success',
	})

	const scrollY = useRef(new Animated.Value(0)).current

	const showToast = useCallback(
		(message: string, type: 'success' | 'error' | 'warning' = 'success') => {
			setToast({
				visible: true,
				message,
				type,
			})
		},
		[],
	)

	const loadProfile = useCallback(async () => {
		try {
			setLoading(true)

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

			const currentUser = response.user

			setUser(currentUser)
			setName(currentUser.name || '')
			setEmail(currentUser.email || '')
			setPhone(currentUser.profile?.phone || '')
			setBirthDate(formatDateForApp(currentUser.profile?.birth_date))
			setCity(currentUser.profile?.city || '')
			setCountry(currentUser.profile?.country || '')
		} catch (error) {
			showToast(
				error instanceof Error
					? error.message
					: 'No fue posible cargar el perfil.',
				'error',
			)
		} finally {
			setLoading(false)
		}
	}, [showToast])

	useEffect(() => {
		void loadProfile()
	}, [loadProfile])

	const clearFieldError = (field: keyof FormErrors) => {
		setErrors((current) => ({
			...current,
			[field]: undefined,
		}))
	}

	const handleDateChange = (_event: unknown, selectedDate?: Date) => {
		setShowDatePicker(false)

		if (!selectedDate) {
			return
		}

		setBirthDate(formatDateForDisplay(selectedDate))
		clearFieldError('birth_date')
	}

	const handleSave = async () => {
		const newErrors: FormErrors = {}

		if (!name.trim()) {
			newErrors.name = 'El nombre es obligatorio.'
		}

		if (!email.trim()) {
			newErrors.email = 'El correo es obligatorio.'
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors)
			showToast('Revisa los campos marcados.', 'warning')
			return
		}

		try {
			setSaving(true)
			setErrors({})

			const token = await getToken()

			if (!token) {
				router.replace('/login')
				return
			}

			const response = await api<UpdateProfileResponse>('/profile', {
				method: 'PUT',
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					name: name.trim(),
					email: email.trim(),
					phone: phone.trim() || null,
					birth_date: formatDateForApi(birthDate),
					city: city.trim() || null,
					country: country.trim() || null,
				}),
			})

			setUser(response.user)
			setName(response.user.name || '')
			setEmail(response.user.email || '')
			setPhone(response.user.profile?.phone || '')
			setBirthDate(formatDateForApp(response.user.profile?.birth_date))
			setCity(response.user.profile?.city || '')
			setCountry(response.user.profile?.country || '')

			showToast(
				response.message || 'Perfil actualizado correctamente.',
				'success',
			)
		} catch (error) {
			if (error instanceof ApiValidationError) {
				const validationErrors: FormErrors = {}

				Object.entries(error.errors).forEach(([field, messages]) => {
					if (
						[
							'name',
							'email',
							'phone',
							'birth_date',
							'city',
							'country',
						].includes(field)
					) {
						validationErrors[field as keyof FormErrors] = messages[0]
					}
				})

				setErrors(validationErrors)

				showToast(error.message || 'Revisa los datos ingresados.', 'warning')

				return
			}

			showToast(
				error instanceof Error
					? error.message
					: 'No fue posible actualizar el perfil.',
				'error',
			)
		} finally {
			setSaving(false)
		}
	}

	const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
		try {
			setUploadingAvatar(true)

			const token = await getToken()

			if (!token) {
				router.replace('/login')
				return
			}

			const file = new FileSystem.File(asset.uri)

			if (!file.exists) {
				throw new Error('No fue posible acceder a la imagen seleccionada.')
			}

			const formData = new FormData()

			formData.append('avatar', file as unknown as Blob)

			const response = await fetch(`${API_URL}/profile/avatar`, {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			})

			const responseText = await response.text()

			let data:
				| AvatarResponse
				| {
						message?: string
						errors?: Record<string, string[]>
				  }

			try {
				data = JSON.parse(responseText)
			} catch {
				throw new Error(
					`Respuesta inválida del servidor. Código HTTP: ${response.status}`,
				)
			}

			if (!response.ok) {
				const errorData = data as {
					message?: string
					errors?: Record<string, string[]>
				}

				if (response.status === 401) {
					throw new Error(
						'La sesión ya no es válida. Inicia sesión nuevamente.',
					)
				}

				if (errorData.errors) {
					const firstError = Object.values(errorData.errors)[0]?.[0]

					if (firstError) {
						throw new Error(firstError)
					}
				}

				throw new Error(
					errorData.message ||
						`No fue posible actualizar la foto. Código HTTP: ${response.status}`,
				)
			}

			const avatarResponse = data as AvatarResponse

			setUser(avatarResponse.user)

			showToast(
				avatarResponse.message || 'Foto de perfil actualizada correctamente.',
				'success',
			)
		} catch (error) {
			console.error('UPLOAD AVATAR ERROR:', error)

			showToast(
				error instanceof Error
					? error.message
					: 'No fue posible actualizar la foto.',
				'error',
			)
		} finally {
			setUploadingAvatar(false)
		}
	}

	const handlePickAvatar = async () => {
		try {
			const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()

			if (!permission.granted) {
				showToast('Necesitamos permiso para seleccionar una foto.', 'warning')
				return
			}

			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ['images'],
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.85,
				allowsMultipleSelection: false,
			})

			if (result.canceled || !result.assets || result.assets.length === 0) {
				return
			}

			const asset = result.assets[0]

			Alert.alert(
				'Actualizar foto',
				'¿Quieres usar esta imagen como foto de perfil?',
				[
					{
						text: 'Cancelar',
						style: 'cancel',
					},
					{
						text: 'Aceptar',
						onPress: () => {
							void uploadAvatar(asset)
						},
					},
				],
			)
		} catch (error) {
			showToast(
				error instanceof Error
					? error.message
					: 'No fue posible seleccionar la imagen.',
				'error',
			)
		}
	}

	if (loading) {
		return (
			<View
				className='flex-1 items-center justify-center'
				style={{
					backgroundColor: '#F7F8F3',
				}}
			>
				<ActivityIndicator size='large' color='#087A5A' />

				<Text
					className='mt-4 text-sm font-medium'
					style={{
						color: '#6F8A7D',
					}}
				>
					Cargando perfil...
				</Text>
			</View>
		)
	}

	const avatarUrl = getAvatarUrl(user?.profile?.avatar)

	const points = user?.gamification?.points ?? user?.points ?? 0

	const currentLevel =
		user?.gamification?.current_level?.name || user?.level?.name || 'Sin nivel'

	const progress = Math.min(100, Math.max(0, user?.gamification?.progress ?? 0))

	const pointsToNextLevel = user?.gamification?.points_to_next_level ?? 0

	const nextLevel = user?.gamification?.next_level?.name || ''

	/*
	 * =========================================
	 * ANIMACIONES
	 * =========================================
	 */

	const coverHeight = scrollY.interpolate({
		inputRange: [0, 180],
		outputRange: [300, 145],
		extrapolate: 'clamp',
	})

	const avatarScale = scrollY.interpolate({
		inputRange: [0, 180],
		outputRange: [1, 0.72],
		extrapolate: 'clamp',
	})

	const avatarTranslateY = scrollY.interpolate({
		inputRange: [0, 180],
		outputRange: [0, -72],
		extrapolate: 'clamp',
	})

	const nameTranslateY = scrollY.interpolate({
		inputRange: [0, 180],
		outputRange: [0, -58],
		extrapolate: 'clamp',
	})

	const emailOpacity = scrollY.interpolate({
		inputRange: [0, 90, 150],
		outputRange: [1, 0.4, 0],
		extrapolate: 'clamp',
	})

	const backButtonOpacity = scrollY.interpolate({
		inputRange: [0, 70, 130],
		outputRange: [1, 0.65, 0],
		extrapolate: 'clamp',
	})

	const progressMarginTop = scrollY.interpolate({
		inputRange: [0, 180],
		outputRange: [-30, -100],
		extrapolate: 'clamp',
	})

	return (
		<KeyboardAvoidingView
			className='flex-1'
			style={{
				backgroundColor: '#F7F8F3',
			}}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<Toast
				visible={toast.visible}
				message={toast.message}
				type={toast.type}
				onHide={() =>
					setToast((current) => ({
						...current,
						visible: false,
					}))
				}
			/>

			<Animated.ScrollView
				className='flex-1'
				keyboardShouldPersistTaps='handled'
				showsVerticalScrollIndicator={false}
				scrollEventThrottle={16}
				onScroll={Animated.event(
					[
						{
							nativeEvent: {
								contentOffset: {
									y: scrollY,
								},
							},
						},
					],
					{
						useNativeDriver: false,
					},
				)}
			>
				{/* =========================================
					ENCABEZADO
				========================================= */}

				<View className='relative'>
					<Animated.Image
						source={require('../../assets/images/profile-background.png')}
						resizeMode='cover'
						style={{
							height: coverHeight,
							width: '100%',
						}}
					/>

					{/* BOTÓN REGRESAR */}

					<Animated.View
						className='absolute left-5 top-14 z-20'
						style={{
							opacity: backButtonOpacity,
						}}
					>
						<Pressable
							onPress={() => router.back()}
							className='flex-row items-center rounded-2xl px-4 py-2.5'
							style={{
								backgroundColor: 'rgba(247,248,243,0.92)',
								borderWidth: 1,
								borderColor: 'rgba(255,255,255,0.75)',
								shadowColor: '#123C32',
								shadowOffset: {
									width: 0,
									height: 2,
								},
								shadowOpacity: 0.12,
								shadowRadius: 5,
								elevation: 2,
							}}
						>
							<Text
								className='mr-1 text-lg font-bold'
								style={{
									color: '#064D36',
								}}
							>
								‹
							</Text>

							<Text
								className='text-base font-semibold'
								style={{
									color: '#123C32',
								}}
							>
								Regresar
							</Text>
						</Pressable>
					</Animated.View>

					{/* PERFIL */}

					<View
						className='absolute left-0 right-0 items-center'
						style={{
							top: 0,
							paddingTop: 80,
						}}
					>
						{/* FOTO */}

						<Pressable onPress={handlePickAvatar} disabled={uploadingAvatar}>
							<Animated.View
								style={{
									width: 116,
									height: 116,
									borderRadius: 58,
									backgroundColor: '#DCEFE5',
									alignItems: 'center',
									justifyContent: 'center',
									overflow: 'hidden',
									borderWidth: 5,
									borderColor: '#F7F7EE',
									elevation: 7,
									shadowColor: '#064D36',
									shadowOffset: {
										width: 0,
										height: 4,
									},
									shadowOpacity: 0.2,
									shadowRadius: 9,
									transform: [
										{
											scale: avatarScale,
										},
										{
											translateY: avatarTranslateY,
										},
									],
								}}
							>
								{avatarUrl ? (
									<Image
										source={{
											uri: avatarUrl,
										}}
										style={{
											width: '100%',
											height: '100%',
										}}
										resizeMode='cover'
									/>
								) : (
									<Text
										className='text-5xl font-bold'
										style={{
											color: '#087A5A',
										}}
									>
										{user?.name?.charAt(0).toUpperCase() || '?'}
									</Text>
								)}

								{uploadingAvatar && (
									<View
										style={{
											position: 'absolute',
											top: 0,
											left: 0,
											right: 0,
											bottom: 0,
											backgroundColor: 'rgba(6,77,54,0.52)',
											alignItems: 'center',
											justifyContent: 'center',
										}}
									>
										<ActivityIndicator size='large' color='#FFFFFF' />
									</View>
								)}
							</Animated.View>

							{/* CAMBIAR FOTO */}

							<View
								style={{
									position: 'absolute',
									right: -2,
									bottom: -2,
									width: 35,
									height: 35,
									borderRadius: 18,
									backgroundColor: '#087A5A',
									alignItems: 'center',
									justifyContent: 'center',
									borderWidth: 3,
									borderColor: '#F7F7EE',
									shadowColor: '#064D36',
									shadowOffset: {
										width: 0,
										height: 2,
									},
									shadowOpacity: 0.2,
									shadowRadius: 4,
									elevation: 3,
								}}
							>
								<Text className='text-xl font-bold text-white'>+</Text>
							</View>
						</Pressable>

						{/* NOMBRE */}

						<Animated.Text
							className='mt-5 text-2xl font-bold'
							style={{
								color: '#FFFFFF',
								textShadowColor: 'rgba(0,0,0,0.18)',
								textShadowOffset: {
									width: 0,
									height: 1,
								},
								textShadowRadius: 3,
								transform: [
									{
										translateY: nameTranslateY,
									},
								],
							}}
						>
							{user?.name || 'Visitante'}
						</Animated.Text>

						{/* CORREO */}

						<Animated.Text
							className='mt-1 text-base'
							style={{
								color: '#F7F7EE',
								opacity: emailOpacity,
							}}
						>
							{user?.email || ''}
						</Animated.Text>
					</View>
				</View>

				{/* =========================================
					TU PROGRESO
				========================================= */}

				<Animated.View
					className='relative z-10 overflow-hidden rounded-t-[30px]'
					style={{
						marginTop: progressMarginTop,
						backgroundColor: '#F7F8F3',
					}}
				>
					<View className='px-5 py-7'>
						<Text
							className='text-xl font-bold'
							style={{
								color: '#064D36',
							}}
						>
							Tu progreso
						</Text>

						<Text
							className='mt-1 text-base'
							style={{
								color: '#6F8A7D',
							}}
						>
							Sigue acumulando puntos en ZooApp.
						</Text>

						<View className='mt-5 flex-row'>
							{/* PUNTOS */}

							<View
								className='flex-1 rounded-2xl p-4'
								style={{
									backgroundColor: '#DCEFE5',
									borderWidth: 1,
									borderColor: '#B8DCCA',
									shadowColor: '#064D36',
									shadowOffset: {
										width: 0,
										height: 2,
									},
									shadowOpacity: 0.07,
									shadowRadius: 5,
									elevation: 2,
								}}
							>
								<Text
									className='text-xs font-bold uppercase tracking-wide'
									style={{
										color: '#087A5A',
									}}
								>
									Puntos
								</Text>

								<Text
									className='mt-2 text-3xl font-bold'
									style={{
										color: '#064D36',
									}}
								>
									{points}
								</Text>
							</View>

							{/* NIVEL */}

							<View
								className='ml-3 flex-1 rounded-2xl p-4'
								style={{
									backgroundColor: '#FFFFFF',
									borderWidth: 1,
									borderColor: '#B8DCCA',
									shadowColor: '#064D36',
									shadowOffset: {
										width: 0,
										height: 2,
									},
									shadowOpacity: 0.06,
									shadowRadius: 5,
									elevation: 2,
								}}
							>
								<Text
									className='text-xs font-bold uppercase tracking-wide'
									style={{
										color: '#6F8A7D',
									}}
								>
									Nivel
								</Text>

								<Text
									className='mt-2 text-lg font-bold'
									style={{
										color: '#123C32',
									}}
								>
									{currentLevel}
								</Text>
							</View>
						</View>

						{user?.gamification?.next_level && (
							<View className='mt-6'>
								<View className='flex-row items-center justify-between'>
									<Text
										className='text-sm font-semibold'
										style={{
											color: '#123C32',
										}}
									>
										Progreso al siguiente nivel
									</Text>

									<Text
										className='text-sm font-bold'
										style={{
											color: '#087A5A',
										}}
									>
										{progress}%
									</Text>
								</View>

								<View
									className='mt-3 h-3 overflow-hidden rounded-full'
									style={{
										backgroundColor: '#DCEFE5',
									}}
								>
									<View
										className='h-full rounded-full'
										style={{
											width: `${progress}%`,
											backgroundColor: '#087A5A',
										}}
									/>
								</View>

								<Text
									className='mt-3 text-base leading-5'
									style={{
										color: '#6F8A7D',
									}}
								>
									Te faltan{' '}
									<Text
										className='font-bold'
										style={{
											color: '#123C32',
										}}
									>
										{pointsToNextLevel}
									</Text>{' '}
									puntos para{' '}
									<Text
										className='font-semibold'
										style={{
											color: '#123C32',
										}}
									>
										{nextLevel}
									</Text>
									.
								</Text>
							</View>
						)}
					</View>
				</Animated.View>

				{/* =========================================
					DATOS PERSONALES
				========================================= */}

				<View
					className='mt-4 px-5 py-7'
					style={{
						backgroundColor: '#F7F8F3',
					}}
				>
					<Text
						className='text-xl font-bold'
						style={{
							color: '#064D36',
						}}
					>
						Datos personales
					</Text>

					<Text
						className='mt-1 text-base'
						style={{
							color: '#6F8A7D',
						}}
					>
						Mantén actualizada tu información.
					</Text>

					{/* NOMBRE */}

					<View className='mt-6'>
						<Text
							className='mb-2 text-sm font-semibold'
							style={{
								color: '#123C32',
							}}
						>
							Nombre
						</Text>

						<View
							className='flex-row items-center rounded-2xl border'
							style={{
								backgroundColor: '#FFFFFF',
								borderColor: errors.name ? '#C83B3B' : '#B8DCCA',
								shadowColor: '#064D36',
								shadowOffset: {
									width: 0,
									height: 1,
								},
								shadowOpacity: 0.04,
								shadowRadius: 4,
								elevation: 1,
							}}
						>
							<View className='pl-4'>
								<HugeiconsIcon
									icon={UserIcon}
									size={21}
									strokeWidth={1.8}
									color='#6F8A7D'
								/>
							</View>

							<TextInput
								value={name}
								onChangeText={(value) => {
									setName(value)
									clearFieldError('name')
								}}
								placeholder='Nombre completo'
								placeholderTextColor='#6F8A7D'
								autoCapitalize='words'
								className='flex-1 px-3 py-4 text-base'
								style={{
									color: '#123C32',
								}}
							/>
						</View>

						{errors.name && (
							<Text
								className='mt-1 text-sm'
								style={{
									color: '#C83B3B',
								}}
							>
								{errors.name}
							</Text>
						)}
					</View>

					{/* EMAIL */}

					<View className='mt-5'>
						<Text
							className='mb-2 text-sm font-semibold'
							style={{
								color: '#123C32',
							}}
						>
							Correo electrónico
						</Text>

						<View
							className='flex-row items-center rounded-2xl border'
							style={{
								backgroundColor: '#FFFFFF',
								borderColor: errors.email ? '#C83B3B' : '#B8DCCA',
								shadowColor: '#064D36',
								shadowOffset: {
									width: 0,
									height: 1,
								},
								shadowOpacity: 0.04,
								shadowRadius: 4,
								elevation: 1,
							}}
						>
							<View className='pl-4'>
								<HugeiconsIcon
									icon={Mail01Icon}
									size={21}
									strokeWidth={1.8}
									color='#6F8A7D'
								/>
							</View>

							<TextInput
								value={email}
								onChangeText={(value) => {
									setEmail(value)
									clearFieldError('email')
								}}
								placeholder='correo@ejemplo.com'
								placeholderTextColor='#6F8A7D'
								keyboardType='email-address'
								autoCapitalize='none'
								autoCorrect={false}
								className='flex-1 px-3 py-4 text-base'
								style={{
									color: '#123C32',
								}}
							/>
						</View>

						{errors.email && (
							<Text
								className='mt-1 text-sm'
								style={{
									color: '#C83B3B',
								}}
							>
								{errors.email}
							</Text>
						)}
					</View>

					{/* TELÉFONO */}

					<View className='mt-5'>
						<Text
							className='mb-2 text-sm font-semibold'
							style={{
								color: '#123C32',
							}}
						>
							Teléfono
						</Text>

						<View
							className='flex-row items-center rounded-2xl border'
							style={{
								backgroundColor: '#FFFFFF',
								borderColor: errors.phone ? '#C83B3B' : '#B8DCCA',
								shadowColor: '#064D36',
								shadowOffset: {
									width: 0,
									height: 1,
								},
								shadowOpacity: 0.04,
								shadowRadius: 4,
								elevation: 1,
							}}
						>
							<View className='pl-4'>
								<HugeiconsIcon
									icon={Call02Icon}
									size={21}
									strokeWidth={1.8}
									color='#6F8A7D'
								/>
							</View>

							<TextInput
								value={phone}
								onChangeText={(value) => {
									setPhone(value)
									clearFieldError('phone')
								}}
								placeholder='Número de teléfono'
								placeholderTextColor='#6F8A7D'
								keyboardType='phone-pad'
								className='flex-1 px-3 py-4 text-base'
								style={{
									color: '#123C32',
								}}
							/>
						</View>

						{errors.phone && (
							<Text
								className='mt-1 text-sm'
								style={{
									color: '#C83B3B',
								}}
							>
								{errors.phone}
							</Text>
						)}
					</View>

					{/* FECHA DE NACIMIENTO */}

					<View className='mt-5'>
						<Text
							className='mb-2 text-sm font-semibold'
							style={{
								color: '#123C32',
							}}
						>
							Fecha de nacimiento
						</Text>

						<Pressable
							onPress={() => setShowDatePicker(true)}
							className='flex-row items-center rounded-2xl border px-4 py-4'
							style={{
								backgroundColor: '#FFFFFF',
								borderColor: errors.birth_date ? '#C83B3B' : '#B8DCCA',
								shadowColor: '#064D36',
								shadowOffset: {
									width: 0,
									height: 1,
								},
								shadowOpacity: 0.04,
								shadowRadius: 4,
								elevation: 1,
							}}
						>
							<HugeiconsIcon
								icon={Calendar03Icon}
								size={21}
								strokeWidth={1.8}
								color='#6F8A7D'
							/>

							<Text
								className='ml-3 flex-1 text-base'
								style={{
									color: birthDate ? '#123C32' : '#6F8A7D',
								}}
							>
								{birthDate || 'Seleccionar fecha'}
							</Text>
						</Pressable>

						{showDatePicker && (
							<DateTimePicker
								value={parseApiDate(formatDateForApi(birthDate))}
								mode='date'
								display={Platform.OS === 'ios' ? 'spinner' : 'default'}
								maximumDate={new Date()}
								onChange={handleDateChange}
							/>
						)}

						{errors.birth_date && (
							<Text
								className='mt-1 text-sm'
								style={{
									color: '#C83B3B',
								}}
							>
								{errors.birth_date}
							</Text>
						)}
					</View>

					{/* CIUDAD */}

					<View className='mt-5'>
						<Text
							className='mb-2 text-sm font-semibold'
							style={{
								color: '#123C32',
							}}
						>
							Ciudad
						</Text>

						<View
							className='flex-row items-center rounded-2xl border'
							style={{
								backgroundColor: '#FFFFFF',
								borderColor: errors.city ? '#C83B3B' : '#B8DCCA',
								shadowColor: '#064D36',
								shadowOffset: {
									width: 0,
									height: 1,
								},
								shadowOpacity: 0.04,
								shadowRadius: 4,
								elevation: 1,
							}}
						>
							<View className='pl-4'>
								<HugeiconsIcon
									icon={Location01Icon}
									size={21}
									strokeWidth={1.8}
									color='#6F8A7D'
								/>
							</View>

							<TextInput
								value={city}
								onChangeText={(value) => {
									setCity(value)
									clearFieldError('city')
								}}
								placeholder='Ciudad'
								placeholderTextColor='#6F8A7D'
								className='flex-1 px-3 py-4 text-base'
								style={{
									color: '#123C32',
								}}
							/>
						</View>

						{errors.city && (
							<Text
								className='mt-1 text-sm'
								style={{
									color: '#C83B3B',
								}}
							>
								{errors.city}
							</Text>
						)}
					</View>

					{/* PAÍS */}

					<View className='mt-5'>
						<Text
							className='mb-2 text-sm font-semibold'
							style={{
								color: '#123C32',
							}}
						>
							País
						</Text>

						<View
							className='flex-row items-center rounded-2xl border'
							style={{
								backgroundColor: '#FFFFFF',
								borderColor: errors.country ? '#C83B3B' : '#B8DCCA',
								shadowColor: '#064D36',
								shadowOffset: {
									width: 0,
									height: 1,
								},
								shadowOpacity: 0.04,
								shadowRadius: 4,
								elevation: 1,
							}}
						>
							<View className='pl-4'>
								<HugeiconsIcon
									icon={Globe02Icon}
									size={21}
									strokeWidth={1.8}
									color='#6F8A7D'
								/>
							</View>

							<TextInput
								value={country}
								onChangeText={(value) => {
									setCountry(value)
									clearFieldError('country')
								}}
								placeholder='País'
								placeholderTextColor='#6F8A7D'
								className='flex-1 px-3 py-4 text-base'
								style={{
									color: '#123C32',
								}}
							/>
						</View>

						{errors.country && (
							<Text
								className='mt-1 text-sm'
								style={{
									color: '#C83B3B',
								}}
							>
								{errors.country}
							</Text>
						)}
					</View>

					{/* GUARDAR */}

					<Pressable
						onPress={handleSave}
						disabled={saving}
						className={`mt-7 rounded-2xl ${saving ? 'opacity-60' : ''}`}
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
								{saving ? (
									<ActivityIndicator color='#FFFFFF' />
								) : (
									<Text
										className='text-base font-bold'
										style={{
											color: '#FFFFFF',
										}}
									>
										Guardar cambios
									</Text>
								)}
							</View>
						)}
					</Pressable>
				</View>
			</Animated.ScrollView>
		</KeyboardAvoidingView>
	)
}
