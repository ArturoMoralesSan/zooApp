import { Pressable, Text, View } from 'react-native'

export type SegmentedTab<K extends string> = {
	key: K
	label: string
	// Shown in a pill next to the label.
	count?: number
}

type SegmentedTabsProps<K extends string> = {
	tabs: SegmentedTab<K>[]
	value: K
	onChange: (key: K) => void
	// Spacing around the control, never its look.
	className?: string
}

// Niebla track with a 1.5px border; the selected tab is solid Esmeralda.
export function SegmentedTabs<K extends string>({
	tabs,
	value,
	onChange,
	className = 'mb-4',
}: SegmentedTabsProps<K>) {
	return (
		<View
			className={`flex-row rounded-2xl border-1.5 border-card-border bg-niebla p-1 ${className}`}
			accessibilityRole='tablist'
		>
			{tabs.map((tab) => {
				const selected = tab.key === value

				return (
					<Pressable
						key={tab.key}
						onPress={() => onChange(tab.key)}
						accessibilityRole='tab'
						accessibilityState={{ selected }}
						className={`min-h-11 flex-1 flex-row items-center justify-center gap-[7px] rounded-xl ${selected ? 'bg-esmeralda' : ''}`}
					>
						<Text
							className={`text-[13px] ${selected ? 'font-sans-x text-blanco' : 'font-sans-semibold text-tinta-2'}`}
						>
							{tab.label}
						</Text>

						{tab.count !== undefined && (
							<View
								className={`h-[22px] min-w-[22px] items-center justify-center rounded-full px-1.5 ${selected ? 'bg-blanco' : 'bg-hoja'}`}
							>
								<Text
									className={`font-display-x text-[12px] ${selected ? 'text-esmeralda' : 'text-tinta'}`}
								>
									{tab.count}
								</Text>
							</View>
						)}
					</Pressable>
				)
			})}
		</View>
	)
}
