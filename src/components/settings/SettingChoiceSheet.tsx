import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { Text, View } from 'react-native'

import { SettingOptionCard } from '@/components/settings/SettingOptionCard'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { IconButton } from '@/components/ui/IconButton'
import type { SettingOption } from '@/types/settings'

type SettingChoiceSheetProps<T extends string> = {
	visible: boolean
	title: string
	description?: string
	options: SettingOption<T>[]
	value: T
	onChange: (value: T) => void
	onClose: () => void
}

// One setting's options, each explained. Choosing one closes the sheet.
export function SettingChoiceSheet<T extends string>({
	visible,
	title,
	description,
	options,
	value,
	onChange,
	onClose,
}: SettingChoiceSheetProps<T>) {
	return (
		<BottomSheet visible={visible} onClose={onClose}>
			<View className='flex-row items-start gap-3'>
				<View style={{ flex: 1, minWidth: 0 }}>
					<Text className='text-h1'>{title}</Text>
					{description && (
						<Text className='text-subtitle mt-2'>{description}</Text>
					)}
				</View>

				<IconButton
					icon={Cancel01Icon}
					onPress={onClose}
					accessibilityLabel='Cerrar'
				/>
			</View>

			<View accessibilityRole='radiogroup' className='mt-5 gap-3'>
				{options.map((option) => (
					<SettingOptionCard
						key={option.value}
						option={option}
						selected={option.value === value}
						onPress={() => {
							onChange(option.value)
							onClose()
						}}
					/>
				))}
			</View>
		</BottomSheet>
	)
}
