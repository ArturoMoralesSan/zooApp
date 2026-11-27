import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { Fragment, useState } from 'react'
import { Linking, ScrollView, Text, View } from 'react-native'

import { BottomSheet } from '@/components/ui/BottomSheet'
import { Divider } from '@/components/ui/Divider'
import { IconButton } from '@/components/ui/IconButton'
import { TextLink } from '@/components/ui/TextLink'
import { licenseSummary, type LicenseGroup } from '@/utils/credits'

type LicenseSheetProps = {
	group: LicenseGroup | null
	onClose: () => void
}

// A licence in plain words, its official text and the works that use it.
export function LicenseSheet({ group: next, onClose }: LicenseSheetProps) {
	// The last licence stays while the sheet slides out.
	const [group, setGroup] = useState(next)
	if (next && next !== group) setGroup(next)

	const url = group?.license.url

	return (
		<BottomSheet visible={next !== null} onClose={onClose}>
			{group && (
				<>
					<View className='flex-row items-start gap-3'>
						<View style={{ flex: 1, minWidth: 0 }}>
							<Text className='text-h1'>{group.license.short_name}</Text>
							<Text className='text-subtitle mt-2'>{group.license.name}</Text>
						</View>

						<IconButton
							icon={Cancel01Icon}
							onPress={onClose}
							accessibilityLabel='Cerrar'
						/>
					</View>

					<ScrollView showsVerticalScrollIndicator={false} className='mt-4'>
						<Text className='text-body text-tinta'>
							{licenseSummary(group.license)}
						</Text>

						{url && (
							<TextLink
								label='Leer la licencia completa'
								onPress={() => void Linking.openURL(url)}
							/>
						)}

						<Text className='text-overline mb-2 mt-4'>
							{group.uses.length === 1
								? '1 obra con esta licencia'
								: `${group.uses.length} obras con esta licencia`}
						</Text>

						{group.uses.map(({ credit, cardName }, index) => (
							<Fragment key={credit.id}>
								{index > 0 && <Divider className='my-3' />}
								<Text className='text-meta'>
									{cardName} · {credit.asset_label}
								</Text>
								<Text className='text-body mt-1 text-tinta'>
									{credit.attribution}
								</Text>
							</Fragment>
						))}
					</ScrollView>
				</>
			)}
		</BottomSheet>
	)
}
