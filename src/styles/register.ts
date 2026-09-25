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
	error: '#C83B3B',
	errorBackground: '#FFF1F0',
	errorBorder: '#FFE3E1',
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

	scrollView: {
		flex: 1,
	},

	scrollContent: {
		paddingHorizontal: 24,
		paddingTop: 45,
		paddingBottom: 60,
	},

	backButton: {
		flexDirection: 'row',
		alignItems: 'center',
		alignSelf: 'flex-start',
		marginBottom: 8,
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 16,
		backgroundColor: colors.inputBackground,
	},

	backButtonPressed: {
		backgroundColor: '#CBE6D9',
	},

	backArrow: {
		marginRight: 4,
		fontSize: 18,
		fontWeight: '700',
		color: colors.dark,
		lineHeight: 22,
	},

	backText: {
		fontSize: 14,
		fontWeight: '600',
		color: colors.white,
	},

	logoContainer: {
		alignItems: 'center',
	},

	logo: {
		width: 144,
		height: 144,
	},

	card: {
		marginTop: 32,
		padding: 20,
		borderRadius: 24,
		backgroundColor: colors.background,
		borderWidth: 1,
		borderColor: colors.cardBorder,
		...shadows.card,
	},

	header: {
		alignItems: 'center',
	},

	title: {
		color: colors.dark,
		fontSize: 30,
		fontWeight: '700',
		textAlign: 'center',
	},

	subtitle: {
		marginTop: 8,
		color: colors.muted,
		fontSize: 16,
		lineHeight: 24,
		textAlign: 'center',
	},

	labelFirst: {
		marginTop: 32,
		marginBottom: 8,
		color: colors.dark,
		fontSize: 14,
		fontWeight: '600',
	},

	label: {
		marginTop: 20,
		marginBottom: 8,
		color: colors.dark,
		fontSize: 14,
		fontWeight: '600',
	},

	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 12,
		borderWidth: 1,
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
	},

	passwordToggle: {
		marginRight: 8,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 12,
		padding: 8,
	},

	fieldError: {
		marginTop: 4,
		color: colors.error,
		fontSize: 14,
		lineHeight: 20,
	},

	generalError: {
		marginTop: 16,
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: colors.errorBackground,
		borderWidth: 1,
		borderColor: colors.errorBorder,
	},

	generalErrorText: {
		color: colors.error,
		fontSize: 14,
		lineHeight: 20,
	},

	registerButton: {
		marginTop: 24,
		borderRadius: 16,
		...shadows.button,
	},

	registerButtonDisabled: {
		opacity: 0.6,
	},

	registerButtonContent: {
		width: '100%',
		alignItems: 'center',
		borderRadius: 16,
		paddingHorizontal: 20,
		paddingVertical: 16,
		backgroundColor: colors.primary,
	},

	registerButtonPressed: {
		backgroundColor: colors.primaryPressed,
	},

	registerButtonText: {
		color: colors.white,
		fontSize: 16,
		fontWeight: '700',
	},

	loginRow: {
		marginTop: 32,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},

	loginText: {
		color: colors.muted,
		fontSize: 16,
	},

	loginButton: {
		borderRadius: 16,
		paddingHorizontal: 4,
	},

	loginButtonText: {
		color: colors.primary,
		fontSize: 16,
		fontWeight: '700',
	},
})
