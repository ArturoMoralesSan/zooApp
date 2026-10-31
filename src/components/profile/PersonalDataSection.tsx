import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { TextField } from '@/components/ui/TextField'
import type { FormErrors } from '@/types/profile'
import {
	Calendar03Icon,
	Call02Icon,
	Globe02Icon,
	Location01Icon,
	Mail01Icon,
	UserIcon,
} from '@hugeicons/core-free-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Platform, View } from 'react-native'
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
		<View className='bg-blanco'>
			<View className='px-5 pb-12 pt-1'>
				<Card>
					<SectionTitle
						title='Datos personales'
						subtitle='Mantén actualizada tu información.'
						className=''
					/>

					<TextField
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

					<TextField
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

					<TextField
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

					<TextField
						label='Fecha de nacimiento'
						icon={Calendar03Icon}
						value={birthDate}
						placeholder='Seleccionar fecha'
						error={errors.birth_date}
						onPress={() => setShowDatePicker(true)}
					/>

					{showDatePicker && (
						<DateTimePicker
							value={parseApiDate(formatDateForApi(birthDate))}
							mode='date'
							display={Platform.OS === 'ios' ? 'spinner' : 'default'}
							maximumDate={new Date()}
							onChange={onDateChange}
						/>
					)}

					<TextField
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

					<TextField
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

					<Button
						title='Guardar cambios'
						onPress={onSave}
						loading={saving}
						className='mt-8'
					/>
				</Card>
			</View>
		</View>
	)
}
