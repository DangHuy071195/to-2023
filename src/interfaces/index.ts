export interface RenderedSlideI {
	position: number
	dataIndex: number
	scale: number
	slideIndex: number
	opacity: number
	key: number
	zIndex: number
}

export interface staticSlideInfo {
	position: number
	scale: number
	opacity: number
	maxTransformDistance: {
		left: number
		right: number
	}
	maxTransformScale: {
		left: number
		right: number
	}
	maxTransformOpacity: {
		left: number
		right: number
	}
	slideIndex: number
}

export interface slideInfoMapI {
	[key: string]: staticSlideInfo
}

