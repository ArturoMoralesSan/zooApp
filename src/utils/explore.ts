export function getEventImageUrl(image: string | null): string | null {
	if (!image) {
		return null
	}

	if (image.startsWith('http://') || image.startsWith('https://')) {
		return image
	}

	return null
}
