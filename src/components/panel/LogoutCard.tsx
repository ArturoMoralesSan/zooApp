import { ListCard } from '@/components/ui/ListCard'
import { Logout01Icon } from '@hugeicons/core-free-icons'

type LogoutCardProps = {
	loggingOut: boolean
	onLogout: () => void
}

export function LogoutCard({ loggingOut, onLogout }: LogoutCardProps) {
	return (
		<ListCard
			icon={Logout01Icon}
			title={loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
			description='Salir de tu cuenta'
			// No handler while logging out, so it can't be pressed twice.
			onPress={loggingOut ? undefined : onLogout}
			className='mt-3'
		/>
	)
}
