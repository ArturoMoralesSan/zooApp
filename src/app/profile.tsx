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
	ImageBackground,
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

/* -------------------------------------------------------------------------- */
/*                                   COLORS                                   */
/* -------------------------------------------------------------------------- */

const colors = {
	background: '#F7F9F8',
	primary: '#075C3B',
	primaryLight: '#16845D',
	card: '#DDF5EA',
	cardLight: '#E8F7F0',
	active: '#BDEED9',
	text: '#17372C',
	textSecondary: '#557067',
	border: '#B8E6D3',
	white: '#FFFFFF',
	coral: '#D95C4F',
	errorBackground: '#FFF3F1',
	errorBorder: '#F3D5D0',
	errorText: '#8C4037',
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
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                              INPUT COMPONENT                               */
/* -------------------------------------------------------------------------- */

type FieldProps = {
	label: string
	icon: typeof UserIcon
	value: string
	placeholder: string
	error?: string
	onChangeText?: (value: string) => void
	onPress?: () => void
	editable?: boolean
	keyboardType?: 'default' | 'email-address' | 'phone-pad'
	autoCapitalize?: 'none' | 'words'
	autoCorrect?: boolean
}

function ProfileField({
	label,
	icon,
	value,
	placeholder,
	error,
	onChangeText,
	onPress,
	editable = true,
	keyboardType = 'default',
	autoCapitalize = 'none',
	autoCorrect = true,
}: FieldProps) {
	const content = (
		<View
			className='flex-row items-center rounded-[18px] px-4'
			style={{
				minHeight: 56,
				backgroundColor: colors.cardLight,
				borderWidth: 1,
				borderColor: error ? colors.coral : colors.border,
			}}
		>
			<HugeiconsIcon
				icon={icon}
				size={20}
				strokeWidth={1.8}
				color={colors.primary}
			/>

			<TextInput
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor='#789187'
				keyboardType={keyboardType}
				autoCapitalize={autoCapitalize}
				autoCorrect={autoCorrect}
				editable={editable}
				className='flex-1 px-3 py-3.5 text-base'
				style={{
					color: colors.text,
				}}
			/>
		</View>
	)

	return (
		<View className='mt-5'>
			<Text
				className='mb-2 text-xs font-bold uppercase tracking-wide'
				style={{
					color: colors.textSecondary,
				}}
			>
				{label}
			</Text>

			{onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content}

			{error && (
				<Text
					className='mt-1 text-xs'
					style={{
						color: colors.coral,
					}}
				>
					{error}
				</Text>
			)}
		</View>
	)
}

/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                   */
/* -------------------------------------------------------------------------- */

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

	/* ---------------------------------------------------------------------- */
	/*                                TOAST                                   */
	/* ---------------------------------------------------------------------- */

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

	/* ---------------------------------------------------------------------- */
	/*                              LOAD PROFILE                               */
	/* ---------------------------------------------------------------------- */

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

	/* ---------------------------------------------------------------------- */
	/*                              FIELD ERRORS                               */
	/* ---------------------------------------------------------------------- */

	const clearFieldError = (field: keyof FormErrors) => {
		setErrors((current) => ({
			...current,
			[field]: undefined,
		}))
	}

	/* ---------------------------------------------------------------------- */
	/*                                  DATE                                   */
	/* ---------------------------------------------------------------------- */

	const handleDateChange = (_event: unknown, selectedDate?: Date) => {
		setShowDatePicker(false)

		if (!selectedDate) {
			return
		}

		setBirthDate(formatDateForDisplay(selectedDate))
		clearFieldError('birth_date')
	}

	/* ---------------------------------------------------------------------- */
	/*                                  SAVE                                   */
	/* ---------------------------------------------------------------------- */

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

	/* ---------------------------------------------------------------------- */
	/*                              UPLOAD AVATAR                              */
	/* ---------------------------------------------------------------------- */

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

	/* ---------------------------------------------------------------------- */
	/*                                  LOADING                               */
	/* ---------------------------------------------------------------------- */

	if (loading) {
		return (
			<ImageBackground
				source={require('@/assets/images/zoo-pattern.png')}
				className='flex-1 items-center justify-center'
				resizeMode='repeat'
				imageStyle={{
					opacity: 0.3,
				}}
				style={{
					backgroundColor: colors.background,
				}}
			>
				<ActivityIndicator size='large' color={colors.primary} />

				<Text
					className='mt-4 text-sm font-medium'
					style={{
						color: colors.textSecondary,
					}}
				>
					Cargando perfil...
				</Text>
			</ImageBackground>
		)
	}

	const avatarUrl = getAvatarUrl(user?.profile?.avatar)

	const points = user?.gamification?.points ?? user?.points ?? 0

	const currentLevel =
		user?.gamification?.current_level?.name || user?.level?.name || 'Sin nivel'

	const progress = Math.min(100, Math.max(0, user?.gamification?.progress ?? 0))

	const pointsToNextLevel = user?.gamification?.points_to_next_level ?? 0

	const nextLevel = user?.gamification?.next_level?.name || ''

	/* ---------------------------------------------------------------------- */
	/*                                ANIMATIONS                              */
	/* ---------------------------------------------------------------------- */

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

	/* ---------------------------------------------------------------------- */
	/*                                    UI                                  */
	/* ---------------------------------------------------------------------- */

	return (
		<ImageBackground
			source={require('@/assets/images/zoo-pattern.png')}
			resizeMode='repeat'
			imageStyle={{
				opacity: 0.3,
			}}
			style={{
				flex: 1,
				backgroundColor: colors.background,
			}}
		>
			<KeyboardAvoidingView
				className='flex-1'
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
					{/* ====================================================== */}
					{/* HEADER                                                 */}
					{/* ====================================================== */}

					<View className='relative'>
						<Animated.Image
							source={require('../../assets/images/profile-background.png')}
							resizeMode='cover'
							style={{
								height: coverHeight,
								width: '100%',
							}}
						/>

						{/* REGRESAR */}

						<Animated.View
							className='absolute left-5 top-14 z-20'
							style={{
								opacity: backButtonOpacity,
							}}
						>
							<Pressable
								onPress={() => router.back()}
								className='flex-row items-center rounded-full px-3.5 py-2.5'
								style={{
									backgroundColor: 'rgba(255,255,255,0.92)',
									...cardShadow,
								}}
							>
								<Text
									className='mr-1 text-xl font-bold'
									style={{
										color: colors.primary,
										lineHeight: 20,
									}}
								>
									‹
								</Text>

								<Text
									className='text-sm font-semibold'
									style={{
										color: colors.text,
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
										width: 112,
										height: 112,
										borderRadius: 56,
										backgroundColor: colors.cardLight,
										alignItems: 'center',
										justifyContent: 'center',
										overflow: 'hidden',
										borderWidth: 5,
										borderColor: colors.white,
										transform: [
											{
												scale: avatarScale,
											},
											{
												translateY: avatarTranslateY,
											},
										],
										...cardShadow,
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
												color: colors.primary,
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
												backgroundColor: 'rgba(7,92,59,0.52)',
												alignItems: 'center',
												justifyContent: 'center',
											}}
										>
											<ActivityIndicator size='large' color={colors.white} />
										</View>
									)}
								</Animated.View>

								{/* CAMBIAR FOTO */}

								<View
									style={{
										position: 'absolute',
										right: -1,
										bottom: -1,
										width: 34,
										height: 34,
										borderRadius: 17,
										backgroundColor: colors.primary,
										alignItems: 'center',
										justifyContent: 'center',
										borderWidth: 3,
										borderColor: colors.white,
										...cardShadow,
									}}
								>
									<Text className='text-xl font-bold text-white'>+</Text>
								</View>
							</Pressable>

							{/* NOMBRE */}

							<Animated.Text
								className='mt-5 text-[23px] font-bold'
								style={{
									color: colors.white,
									textShadowColor: 'rgba(0,0,0,0.2)',
									textShadowOffset: {
										width: 0,
										height: 1,
									},
									textShadowRadius: 4,
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
								className='mt-1 px-8 text-center text-sm'
								style={{
									color: '#F7F7EE',
									opacity: emailOpacity,
								}}
								numberOfLines={1}
							>
								{user?.email || ''}
							</Animated.Text>
						</View>
					</View>

					{/* ====================================================== */}
					{/* PROGRESO                                               */}
					{/* ====================================================== */}

					<Animated.View
						className='relative z-10 overflow-hidden rounded-t-[30px]'
						style={{
							marginTop: progressMarginTop,
							backgroundColor: 'rgba(248,244,234,0.94)',
						}}
					>
						<ImageBackground
							source={require('@/assets/images/zoo-pattern.png')}
							resizeMode='repeat'
							imageStyle={{
								opacity: 0.3,
							}}
							style={{
								backgroundColor: colors.background,
							}}
						>
							<View className='px-5 pb-7 pt-6'>
								<Text
									className='text-[21px] font-bold'
									style={{
										color: colors.primary,
									}}
								>
									Tu progreso
								</Text>

								<Text
									className='mt-1 text-sm'
									style={{
										color: colors.textSecondary,
									}}
								>
									Sigue acumulando puntos en ZooApp.
								</Text>

								<View className='mt-5 flex-row'>
									{/* PUNTOS */}

									<View
										className='flex-1 rounded-[22px] p-4'
										style={{
											backgroundColor: colors.card,
											borderWidth: 1,
											borderColor: colors.border,
										}}
									>
										<Text
											className='text-[11px] font-bold uppercase tracking-wider'
											style={{
												color: colors.primary,
											}}
										>
											Puntos
										</Text>

										<Text
											className='mt-1 text-[29px] font-bold'
											style={{
												color: colors.primary,
											}}
										>
											{points}
										</Text>
									</View>

									{/* NIVEL */}

									<View
										className='ml-3 flex-1 rounded-[22px] p-4'
										style={{
											backgroundColor: colors.cardLight,
											borderWidth: 1,
											borderColor: colors.border,
										}}
									>
										<Text
											className='text-[11px] font-bold uppercase tracking-wider'
											style={{
												color: colors.textSecondary,
											}}
										>
											Nivel
										</Text>

										<Text
											className='mt-1 text-lg font-bold'
											style={{
												color: colors.text,
											}}
											numberOfLines={1}
										>
											{currentLevel}
										</Text>
									</View>
								</View>

								{user?.gamification?.next_level && (
									<View
										className='mt-5 rounded-[22px] p-4'
										style={{
											backgroundColor: colors.cardLight,
											borderWidth: 1,
											borderColor: colors.border,
											...cardShadow,
										}}
									>
										<View className='flex-row items-center justify-between'>
											<Text
												className='flex-1 text-sm font-semibold'
												style={{
													color: colors.text,
												}}
											>
												Progreso al siguiente nivel
											</Text>

											<View
												className='rounded-full px-2.5 py-1'
												style={{
													backgroundColor: colors.active,
												}}
											>
												<Text
													className='text-xs font-bold'
													style={{
														color: colors.primary,
													}}
												>
													{progress}%
												</Text>
											</View>
										</View>

										<View
											className='mt-3 h-2.5 overflow-hidden rounded-full'
											style={{
												backgroundColor: colors.border,
											}}
										>
											<View
												className='h-full rounded-full'
												style={{
													width: `${progress}%`,
													backgroundColor: colors.primary,
												}}
											/>
										</View>

										<Text
											className='mt-3 text-sm leading-5'
											style={{
												color: colors.textSecondary,
											}}
										>
											Te faltan{' '}
											<Text
												className='font-bold'
												style={{
													color: colors.text,
												}}
											>
												{pointsToNextLevel}
											</Text>{' '}
											puntos para{' '}
											<Text
												className='font-semibold'
												style={{
													color: colors.text,
												}}
											>
												{nextLevel}
											</Text>
											.
										</Text>
									</View>
								)}
							</View>
						</ImageBackground>
					</Animated.View>

					{/* ====================================================== */}
					{/* DATOS PERSONALES                                       */}
					{/* ====================================================== */}

					<ImageBackground
						source={require('@/assets/images/zoo-pattern.png')}
						resizeMode='repeat'
						imageStyle={{
							opacity: 0.3,
						}}
						style={{
							backgroundColor: colors.background,
						}}
					>
						<View className='px-5 pb-12 pt-1'>
							<View
								className='rounded-[28px] px-5 pb-6 pt-5'
								style={{
									backgroundColor: colors.card,
									borderWidth: 1,
									borderColor: colors.border,
									...cardShadow,
								}}
							>
								<Text
									className='text-[21px] font-bold'
									style={{
										color: colors.primary,
									}}
								>
									Datos personales
								</Text>

								<Text
									className='mt-1 text-sm'
									style={{
										color: colors.textSecondary,
									}}
								>
									Mantén actualizada tu información.
								</Text>

								{/* NOMBRE */}

								<ProfileField
									label='Nombre'
									icon={UserIcon}
									value={name}
									placeholder='Nombre completo'
									error={errors.name}
									onChangeText={(value) => {
										setName(value)
										clearFieldError('name')
									}}
									autoCapitalize='words'
								/>

								{/* CORREO */}

								<ProfileField
									label='Correo electrónico'
									icon={Mail01Icon}
									value={email}
									placeholder='correo@ejemplo.com'
									error={errors.email}
									onChangeText={(value) => {
										setEmail(value)
										clearFieldError('email')
									}}
									keyboardType='email-address'
									autoCapitalize='none'
									autoCorrect={false}
								/>

								{/* TELÉFONO */}

								<ProfileField
									label='Teléfono'
									icon={Call02Icon}
									value={phone}
									placeholder='Número de teléfono'
									error={errors.phone}
									onChangeText={(value) => {
										setPhone(value)
										clearFieldError('phone')
									}}
									keyboardType='phone-pad'
								/>

								{/* FECHA DE NACIMIENTO */}

								<View className='mt-5'>
									<Text
										className='mb-2 text-xs font-bold uppercase tracking-wide'
										style={{
											color: colors.textSecondary,
										}}
									>
										Fecha de nacimiento
									</Text>

									<Pressable
										onPress={() => setShowDatePicker(true)}
										className='flex-row items-center rounded-[18px] px-4'
										style={{
											minHeight: 56,
											backgroundColor: colors.cardLight,
											borderWidth: 1,
											borderColor: errors.birth_date
												? colors.coral
												: colors.border,
										}}
									>
										<HugeiconsIcon
											icon={Calendar03Icon}
											size={20}
											strokeWidth={1.8}
											color={colors.primary}
										/>

										<Text
											className='ml-3 flex-1 text-base'
											style={{
												color: birthDate ? colors.text : '#789187',
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
											className='mt-1 text-xs'
											style={{
												color: colors.coral,
											}}
										>
											{errors.birth_date}
										</Text>
									)}
								</View>

								{/* CIUDAD */}

								<ProfileField
									label='Ciudad'
									icon={Location01Icon}
									value={city}
									placeholder='Ciudad'
									error={errors.city}
									onChangeText={(value) => {
										setCity(value)
										clearFieldError('city')
									}}
								/>

								{/* PAÍS */}

								<ProfileField
									label='País'
									icon={Globe02Icon}
									value={country}
									placeholder='País'
									error={errors.country}
									onChangeText={(value) => {
										setCountry(value)
										clearFieldError('country')
									}}
								/>

								{/* GUARDAR */}

								<Pressable
									onPress={handleSave}
									disabled={saving}
									className={`mt-7 rounded-[20px] ${
										saving ? 'opacity-60' : ''
									}`}
									style={{
										...cardShadow,
									}}
								>
									{({ pressed }) => (
										<View
											className='w-full items-center rounded-[20px] px-5 py-4'
											style={{
												backgroundColor: pressed
													? colors.primaryLight
													: colors.primary,
											}}
										>
											{saving ? (
												<ActivityIndicator color={colors.white} />
											) : (
												<Text
													className='text-base font-bold'
													style={{
														color: colors.white,
													}}
												>
													Guardar cambios
												</Text>
											)}
										</View>
									)}
								</Pressable>
							</View>
						</View>
					</ImageBackground>
				</Animated.ScrollView>
			</KeyboardAvoidingView>
		</ImageBackground>
	)
}
