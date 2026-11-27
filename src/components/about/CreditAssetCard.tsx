import {
	CubeIcon,
	Image01Icon,
	ImageCropIcon,
} from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react-native'
import { Fragment } from 'react'
import { Text, View } from 'react-native'

import { CreditLine } from '@/components/about/CreditLine'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import colors from '@/theme/colors'
import type { CreditAsset } from '@/types/credits'
import type { AssetGroup } from '@/utils/credits'

const ICONS: Record<CreditAsset, IconSvgElement> = {
	artwork: Image01Icon,
	thumbnail: ImageCropIcon,
	model: CubeIcon,
}

type CreditAssetCardProps = {
	group: AssetGroup
	className?: string
}

// One asset of a card (illustration, thumbnail or 3D model) and its credits.
export function CreditAssetCard({
	group,
	className = '',
}: CreditAssetCardProps) {
	return (
		<Card className={className}>
			<View className='mb-2 flex-row items-center gap-1.5'>
				<Icon icon={ICONS[group.asset]} size={16} color={colors.tinta2} />
				<Text className='text-overline'>{group.label}</Text>
			</View>

			{group.credits.map((credit, index) => (
				<Fragment key={credit.id}>
					{index > 0 && <View className='h-3' />}
					<CreditLine credit={credit} />
				</Fragment>
			))}
		</Card>
	)
}
