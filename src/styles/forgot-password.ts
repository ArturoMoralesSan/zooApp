import { StyleSheet } from 'react-native'

export const colors = {
	background: '#F7F7EE',
	primary: '#087A5A',
	primaryPressed: '#064D36',
	dark: '#123C32',
	muted: '#6F8A7D',
	inputBackground: '#DCEFE5',
	border: '#B8DCCA',
	cardBorder: '#E5E8DF',
	white: '#FFFFFF',
}

const shadows = {
	card: {
		shadowColor: '#123C32',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.1,
		shadowRadius: 10,
		elevation: 3,
	},

	button: {
		shadowColor: '#064D36',
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.16,
		shadowRadius: 7,
		elevation: 4,
	},
}

export const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},

	background: {
		position: 'absolute',
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		overflow: 'hidden',
	},

	backgroundImage: {
		width: '100%',
		height: '100%',
		transform: [{ scale: 1 }],
	},

	content: {
		flex: 1,
		paddingHorizontal: 24,
		paddingTop: 48,
	},

	backText: {
		marginLeft: 4,
		color: colors.white,
		fontSize: 14,
		lineHeight: 20,
		fontWeight: '600',
	},

	logoContainer: {
		alignItems: 'center',
	},

	logo: {
		width: 144,
		height: 144,
	},

	card: {
		marginTop: 12,
		padding: 20,
		borderWidth: 1,
		borderColor: colors.cardBorder,
		borderRadius: 24,
		backgroundColor: colors.background,
		...shadows.card,
	},

	header: {
		alignItems: 'center',
	},

	title: {
		color: colors.dark,
		textAlign: 'center',
		fontSize: 30,
		lineHeight: 36,
		fontWeight: '700',
	},

	subtitle: {
		marginTop: 8,
		color: colors.muted,
		textAlign: 'center',
		fontSize: 16,
		lineHeight: 22,
	},

	label: {
		marginTop: 32,
		marginBottom: 8,
		color: colors.dark,
		fontSize: 14,
		lineHeight: 20,
		fontWeight: '600',
	},

	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderRadius: 12,
		backgroundColor: colors.inputBackground,
	},

	inputIcon: {
		paddingLeft: 16,
	},

	input: {
		flex: 1,
		paddingHorizontal: 12,
		paddingVertical: 16,
		color: colors.dark,
		fontSize: 16,
		lineHeight: 22,
	},

	sendButton: {
		marginTop: 24,
		borderRadius: 16,
		...shadows.button,
	},

	sendButtonContent: {
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderRadius: 16,
		backgroundColor: colors.primary,
	},

	sendButtonPressed: {
		backgroundColor: colors.primaryPressed,
	},

	sendButtonText: {
		color: colors.white,
		fontSize: 16,
		lineHeight: 22,
		fontWeight: '700',
	},

	loginRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 32,
	},

	loginText: {
		color: colors.muted,
		fontSize: 16,
		lineHeight: 22,
	},

	loginButton: {
		paddingHorizontal: 4,
		borderRadius: 16,
	},

	loginButtonText: {
		color: colors.primary,
		fontSize: 16,
		lineHeight: 22,
		fontWeight: '700',
	},
})
