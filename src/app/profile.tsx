import Toast from '@/components/toast'
import { API_URL, ApiValidationError, api } from '@/services/api'
import { getToken, type User } from '@/services/auth'
import DateTimePicker from '@react-native-community/datetimepicker'
import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	Image,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
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
			<View className='flex-1 items-center justify-center bg-gray-50'>
				<ActivityIndicator size='large' color='#047857' />
			</View>
		)
	}

	const avatarUrl = getAvatarUrl(user?.profile?.avatar)

	return (
		<KeyboardAvoidingView
			className='flex-1 bg-gray-50'
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

			<ScrollView
				className='flex-1'
				contentContainerStyle={{
					paddingHorizontal: 20,
					paddingTop: 55,
					paddingBottom: 130,
				}}
				keyboardShouldPersistTaps='handled'
			>
				<Pressable onPress={() => router.back()} className='mb-5'>
					<Text className='text-base font-semibold text-emerald-700'>
						← Regresar
					</Text>
				</Pressable>

				<Text className='text-3xl font-bold text-gray-900'>Mi perfil</Text>

				<Text className='mt-2 text-base text-gray-500'>
					Administra tus datos personales.
				</Text>

				{/* Avatar */}
				<View className='mt-7 items-center'>
					<Pressable
						onPress={handlePickAvatar}
						disabled={uploadingAvatar}
						className='relative'
					>
						<View
							style={{
								width: 110,
								height: 110,
								borderRadius: 55,
								backgroundColor: '#D1FAE5',
								alignItems: 'center',
								justifyContent: 'center',
								overflow: 'hidden',
								borderWidth: 4,
								borderColor: '#FFFFFF',
								elevation: 4,
								shadowColor: '#000',
								shadowOffset: {
									width: 0,
									height: 2,
								},
								shadowOpacity: 0.12,
								shadowRadius: 6,
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
								<Text className='text-4xl font-bold text-emerald-700'>
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
										backgroundColor: 'rgba(0,0,0,0.45)',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<ActivityIndicator size='large' color='#FFFFFF' />
								</View>
							)}
						</View>

						<View
							style={{
								position: 'absolute',
								right: 0,
								bottom: 0,
								width: 34,
								height: 34,
								borderRadius: 17,
								backgroundColor: '#047857',
								alignItems: 'center',
								justifyContent: 'center',
								borderWidth: 3,
								borderColor: '#FFFFFF',
							}}
						>
							<Text className='text-lg font-bold text-white'>+</Text>
						</View>
					</Pressable>

					<Pressable
						onPress={handlePickAvatar}
						disabled={uploadingAvatar}
						className='mt-3'
					>
						<Text className='font-semibold text-emerald-700'>
							{uploadingAvatar ? 'Subiendo foto...' : 'Cambiar foto'}
						</Text>
					</Pressable>
				</View>

				{/* Gamificación */}
				<View className='mt-7 rounded-3xl bg-white p-5'>
					<Text className='text-lg font-bold text-gray-900'>Gamificación</Text>

					<View className='mt-4 flex-row justify-between'>
						<View>
							<Text className='text-sm text-gray-500'>Puntos</Text>

							<Text className='mt-1 text-2xl font-bold text-emerald-700'>
								{user?.gamification?.points ?? user?.points ?? 0}
							</Text>
						</View>

						<View className='items-end'>
							<Text className='text-sm text-gray-500'>Nivel</Text>

							<Text className='mt-1 text-lg font-bold text-gray-900'>
								{user?.gamification?.current_level?.name ||
									user?.level?.name ||
									'Sin nivel'}
							</Text>
						</View>
					</View>

					{user?.gamification?.next_level && (
						<View className='mt-5'>
							<View className='flex-row justify-between'>
								<Text className='text-sm text-gray-500'>Progreso</Text>

								<Text className='text-sm font-semibold text-emerald-700'>
									{user.gamification.progress}%
								</Text>
							</View>

							<View className='mt-2 h-3 overflow-hidden rounded-full bg-gray-100'>
								<View
									className='h-full rounded-full bg-emerald-500'
									style={{
										width: `${Math.min(
											100,
											Math.max(0, user.gamification.progress),
										)}%`,
									}}
								/>
							</View>

							<Text className='mt-2 text-xs text-gray-500'>
								Te faltan {user.gamification.points_to_next_level} puntos para{' '}
								{user.gamification.next_level.name}.
							</Text>
						</View>
					)}
				</View>

				{/* Datos personales */}
				<View className='mt-5 rounded-3xl bg-white p-5'>
					<Text className='text-lg font-bold text-gray-900'>
						Datos personales
					</Text>

					{/* Nombre */}
					<View className='mt-5'>
						<Text className='mb-2 text-sm font-semibold text-gray-700'>
							Nombre
						</Text>

						<TextInput
							value={name}
							onChangeText={(value) => {
								setName(value)
								clearFieldError('name')
							}}
							placeholder='Nombre completo'
							placeholderTextColor='#9ca3af'
							autoCapitalize='words'
							className='rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base text-gray-900'
						/>

						{errors.name && (
							<Text className='mt-1 text-sm text-red-600'>{errors.name}</Text>
						)}
					</View>

					{/* Email */}
					<View className='mt-4'>
						<Text className='mb-2 text-sm font-semibold text-gray-700'>
							Correo electrónico
						</Text>

						<TextInput
							value={email}
							onChangeText={(value) => {
								setEmail(value)
								clearFieldError('email')
							}}
							placeholder='correo@ejemplo.com'
							placeholderTextColor='#9ca3af'
							keyboardType='email-address'
							autoCapitalize='none'
							autoCorrect={false}
							className='rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base text-gray-900'
						/>

						{errors.email && (
							<Text className='mt-1 text-sm text-red-600'>{errors.email}</Text>
						)}
					</View>

					{/* Teléfono */}
					<View className='mt-4'>
						<Text className='mb-2 text-sm font-semibold text-gray-700'>
							Teléfono
						</Text>

						<TextInput
							value={phone}
							onChangeText={(value) => {
								setPhone(value)
								clearFieldError('phone')
							}}
							placeholder='Número de teléfono'
							placeholderTextColor='#9ca3af'
							keyboardType='phone-pad'
							className='rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base text-gray-900'
						/>

						{errors.phone && (
							<Text className='mt-1 text-sm text-red-600'>{errors.phone}</Text>
						)}
					</View>

					{/* Fecha */}
					<View className='mt-4'>
						<Text className='mb-2 text-sm font-semibold text-gray-700'>
							Fecha de nacimiento
						</Text>

						<Pressable
							onPress={() => setShowDatePicker(true)}
							className='rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5'
						>
							<Text
								className={
									birthDate
										? 'text-base text-gray-900'
										: 'text-base text-gray-400'
								}
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
							<Text className='mt-1 text-sm text-red-600'>
								{errors.birth_date}
							</Text>
						)}
					</View>

					{/* Ciudad */}
					<View className='mt-4'>
						<Text className='mb-2 text-sm font-semibold text-gray-700'>
							Ciudad
						</Text>

						<TextInput
							value={city}
							onChangeText={(value) => {
								setCity(value)
								clearFieldError('city')
							}}
							placeholder='Ciudad'
							placeholderTextColor='#9ca3af'
							className='rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base text-gray-900'
						/>

						{errors.city && (
							<Text className='mt-1 text-sm text-red-600'>{errors.city}</Text>
						)}
					</View>

					{/* País */}
					<View className='mt-4'>
						<Text className='mb-2 text-sm font-semibold text-gray-700'>
							País
						</Text>

						<TextInput
							value={country}
							onChangeText={(value) => {
								setCountry(value)
								clearFieldError('country')
							}}
							placeholder='País'
							placeholderTextColor='#9ca3af'
							className='rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base text-gray-900'
						/>

						{errors.country && (
							<Text className='mt-1 text-sm text-red-600'>
								{errors.country}
							</Text>
						)}
					</View>

					{/* Guardar */}
					<Pressable
						onPress={handleSave}
						disabled={saving}
						className={`mt-7 items-center rounded-full px-5 py-4 ${
							saving ? 'bg-emerald-300' : 'bg-emerald-700'
						}`}
					>
						{saving ? (
							<ActivityIndicator color='#FFFFFF' />
						) : (
							<Text className='text-base font-bold text-white'>
								Guardar cambios
							</Text>
						)}
					</Pressable>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
