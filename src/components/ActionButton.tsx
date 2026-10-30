import { Button } from '@/components/ui/Button'

type ActionButtonProps = {
	title: string
	onPress: () => void
	disabled?: boolean
}

// Kept while screens move to Button: same API and top margin as before.
export default function ActionButton(props: ActionButtonProps) {
	return <Button {...props} className='mt-4' />
}
