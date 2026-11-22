import { Linking, Text, View } from 'react-native'

import { TextLink } from '@/components/ui/TextLink'
import type { Credit } from '@/types/credits'

type CreditLineProps = {
	credit: Credit
}

// One credit: the server's attribution line as is, and links to whatever
// it has (author, original work, licence text). "Basado en" and "Incluye"
// lines are indented under their asset's origin.
export function CreditLine({ credit }: CreditLineProps) {
	const links = [
		{ label: 'Autor', url: credit.author?.url },
		{ label: 'Obra original', url: credit.source?.url },
		{ label: 'Licencia', url: credit.license.url },
	].filter((link): link is { label: string; url: string } => Boolean(link.url))

	const nested = credit.role !== 'origin'

	return (
		<View className={nested ? 'ml-1 border-l-2 border-card-border pl-3' : ''}>
			<Text className='text-body text-tinta'>{credit.attribution}</Text>

			{links.length > 0 && (
				<View className='-mb-2 flex-row flex-wrap gap-x-3'>
					{links.map((link) => (
						<TextLink
							key={link.label}
							label={link.label}
							onPress={() => void Linking.openURL(link.url)}
						/>
					))}
				</View>
			)}
		</View>
	)
}
