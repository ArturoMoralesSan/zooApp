import ActionButton from '@/components/ActionButton'
import { ProfileField } from '@/components/profile/ProfileField'
import colors from '@/theme/colors'
import { cardShadow } from '@/theme/shadows'
import type { FormErrors } from '@/types/profile'
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
import { ImageBackground, Platform, Pressable, Text, View } from 'react-native'
import { formatDateForApi, parseApiDate } from '@/utils/date'

type PersonalDataSectionProps = {
	name: string
	email: string
	phone: string
	birthDate: string
	city: string
	country: string
	setName: (value: string) => void
	setEmail: (value: string) => void
	setPhone: (value: string) => void
	setCity: (value: string) => void
	setCountry: (value: string) => void
	errors: FormErrors
	clearFieldError: (field: keyof FormErrors) => void
	showDatePicker: boolean
	setShowDatePicker: (value: boolean) => void
	onDateChange: (_event: unknown, selectedDate?: Date) => void
	saving: boolean
	onSave: () => void
}

export function PersonalDataSection({
	name,
	email,
	phone,
	birthDate,
	city,
	country,
	setName,
	setEmail,
	setPhone,
	setCity,
	setCountry,
	errors,
	clearFieldError,
	showDatePicker,
	setShowDatePicker,
	onDateChange,
	saving,
	onSave,
}: PersonalDataSectionProps) {
	return (
		<ImageBackground
			source={require('@/assets/images/zoo-pattern.png')}
			resizeMode='repeat'
			imageClassName='opacity-[0.12]'
			className='bg-blanco'
		>
			<View className='px-5 pb-12 pt-1'>
				<View
					className='rounded-[22px] border border-card-border bg-niebla px-[18px] pb-6 pt-5'
					style={cardShadow}
				>
					<Text className='text-[21px] font-bold text-tinta'>
						Datos personales
					</Text>

					<Text className='mt-1 text-[14px] text-tinta'>
						Mantén actualizada tu información.
					</Text>

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

					<View className='mt-5'>
						<Text className='mb-2 text-[12px] font-extrabold uppercase tracking-[0.8px] text-tinta'>
							Fecha de nacimiento
						</Text>

						<Pressable
							onPress={() => setShowDatePicker(true)}
							className={`min-h-14 flex-row items-center rounded-[14px] border border-input-border px-4 ${errors.birth_date ? 'bg-niebla' : 'bg-blanco'}`}
						>
							<HugeiconsIcon
								icon={Calendar03Icon}
								size={20}
								strokeWidth={1.8}
								color={colors.esmeralda}
							/>

							<Text className='ml-3 flex-1 text-[16px] text-tinta'>
								{birthDate || 'Seleccionar fecha'}
							</Text>
						</Pressable>

						{showDatePicker && (
							<DateTimePicker
								value={parseApiDate(formatDateForApi(birthDate))}
								mode='date'
								display={Platform.OS === 'ios' ? 'spinner' : 'default'}
								maximumDate={new Date()}
								onChange={onDateChange}
							/>
						)}

						{errors.birth_date && (
							<Text className='mt-1 text-[12px] text-esmeralda'>
								{errors.birth_date}
							</Text>
						)}
					</View>

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

					<ActionButton
						title={saving ? 'Guardando...' : 'Guardar cambios'}
						onPress={onSave}
						disabled={saving}
					/>
				</View>
			</View>
		</ImageBackground>
	)
}
