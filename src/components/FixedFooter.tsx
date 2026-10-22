import { StyleSheet, Text, View } from 'react-native'

import ActionButton from '@/components/ActionButton'

type FixedFooterProps = {
	label: string
	description: string
	amount: string
	buttonTitle: string
	onButtonPress: () => void
	disabled?: boolean
}

export default function FixedFooter({
	label,
	description,
	amount,
	buttonTitle,
	onButtonPress,
	disabled = false,
}: FixedFooterProps) {
	return (
		<View style={styles.footer}>
			<View style={styles.amountContainer}>
				<View style={styles.textContainer}>
					<Text style={styles.label}>{label}</Text>

					<Text style={styles.description}>{description}</Text>
				</View>

				<Text style={styles.amount}>{amount}</Text>
			</View>

			<ActionButton
				title={buttonTitle}
				onPress={onButtonPress}
				disabled={disabled}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	footer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: '#FFFFFF',
		borderTopWidth: 1,
		borderTopColor: '#BDCCC3',
		paddingHorizontal: 20,
		paddingTop: 16,
		paddingBottom: 28,
		zIndex: 999,
		elevation: 15,
	},
	amountContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 12,
	},
	textContainer: {
		flex: 1,
		justifyContent: 'center',
	},
	label: {
		color: '#092114',
		fontSize: 15,
		fontWeight: '800',
	},
	description: {
		color: '#284F3D',
		fontSize: 13,
		fontWeight: '500',
		marginTop: 4,
	},
	amount: {
		color: '#033A1B',
		fontSize: 27,
		fontWeight: '900',
		textAlign: 'right',
	},
})
