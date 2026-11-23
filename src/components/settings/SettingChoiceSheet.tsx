import { Cancel01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { Text, View } from 'react-native'

import { Badge } from '@/components/ui/Badge'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Icon } from '@/components/ui/Icon'
import { IconBox } from '@/components/ui/IconBox'
import { IconButton } from '@/components/ui/IconButton'
import { OptionButton } from '@/components/ui/OptionButton'
import colors from '@/theme/colors'
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
				{options.map((option) => {
					const selected = option.value === value

					return (
						<OptionButton
							key={option.value}
							selected={selected}
							onPress={() => {
								onChange(option.value)
								onClose()
							}}
							accessibilityLabel={`${option.label}${option.badge ? `, ${option.badge}` : ''}. ${option.description}`}
						>
							<View className='flex-row items-center gap-3'>
								<IconBox
									icon={option.icon}
									tone={selected ? 'accent' : 'soft'}
								/>

								<View style={{ flex: 1, minWidth: 0 }}>
									<View className='flex-row flex-wrap items-center gap-2'>
										<Text className='text-h3 text-tinta'>{option.label}</Text>
										{option.badge && (
											<Badge tone='pending' label={option.badge} />
										)}
									</View>
									<Text className='text-meta mt-1'>{option.description}</Text>
								</View>

								{/* The check, not only the border, says which one is on. */}
								{selected && (
									<Icon icon={Tick02Icon} color={colors.esmeralda} strong />
								)}
							</View>
						</OptionButton>
					)
				})}
			</View>
		</BottomSheet>
	)
}
