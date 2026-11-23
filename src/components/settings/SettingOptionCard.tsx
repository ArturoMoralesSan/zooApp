import { Tick02Icon } from '@hugeicons/core-free-icons'
import { Text, View } from 'react-native'

import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { IconBox } from '@/components/ui/IconBox'
import { OptionButton } from '@/components/ui/OptionButton'
import colors from '@/theme/colors'
import type { SettingOption } from '@/types/settings'

type SettingOptionCardProps<T extends string> = {
	option: SettingOption<T>
	selected: boolean
	onPress: () => void
}

// One choice of a setting: icon, label, its explanation, and a check when
// it's the one on.
export function SettingOptionCard<T extends string>({
	option,
	selected,
	onPress,
}: SettingOptionCardProps<T>) {
	return (
		<OptionButton
			selected={selected}
			onPress={onPress}
			accessibilityLabel={`${option.label}${option.badge ? `, ${option.badge}` : ''}. ${option.description}`}
		>
			<View className='flex-row items-center gap-3'>
				<IconBox icon={option.icon} tone={selected ? 'accent' : 'soft'} />

				<View style={{ flex: 1, minWidth: 0 }}>
					<View className='flex-row flex-wrap items-center gap-2'>
						<Text className='text-h3 text-tinta'>{option.label}</Text>
						{option.badge && <Badge tone='pending' label={option.badge} />}
					</View>
					<Text className='text-meta mt-1'>{option.description}</Text>
				</View>

				{/* The check, not only the border, says which one is on. Its slot
				    is always there, so choosing one doesn't rewrap the text. */}
				<View className='size-6 items-center justify-center'>
					{selected && (
						<Icon icon={Tick02Icon} color={colors.esmeralda} strong />
					)}
				</View>
			</View>
		</OptionButton>
	)
}
