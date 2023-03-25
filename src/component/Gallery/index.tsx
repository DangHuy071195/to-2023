import React, { useEffect, useState } from 'react'
import { RenderedSlideI, slideInfoMapI } from '../../interfaces'
interface GalleryProps {
	carouselWidth: number
	slideWidth: number
	currentVisibleSlide: number
	maxVisibleSlide: number //items
	customScales?: number[]
	fadeDistance?: number
	data: any
}
const Gallery: React.FC<GalleryProps> = (props) => {
	const {
		carouselWidth,
		slideWidth,
		currentVisibleSlide: currentVisibleDisplaySlide,
		maxVisibleSlide,
		customScales,
		fadeDistance,
		data,
	} = props
	const [init, setInit] = useState(true)
	const [renderedSlides, setRenderedSlides] = useState([])
	const [initState, setInitState] = useState<any>(null)

	useEffect(() => {
		const { renderedSlides, slideInfoMap, slidePerSide, sortedSlideInfo, centerPosition, renderedSlidePerSide } =
			initProperties()
		setInitState({
			initalSwipeX: 0,
			swipeStarted: false,
			renderedSlides: renderedSlides,
			prevRenderedSlides: [...renderedSlides],
			swipePositionInfo: [],
			swipRight: false,
			tempShift: false,
		})
	}, [])

	const initProperties = () => {
		//calculate current visible slide
		const currentVisibleSlides = currentVisibleDisplaySlide ?? maxVisibleSlide
		//calculate visible slide perside
		const visibleSlidePerSide = (currentVisibleSlides - 1) / 2
		//calculate slide per side
		const slidePerSide = Math.max(visibleSlidePerSide + 1, 1)
		// calculate totalRendered count
		const totalRenderCount = maxVisibleSlide + 2
		const renderedSlidePerSide = (maxVisibleSlide + 1) / 2

		const { offsets, scaledOffsets, scales } = calculateScaleAndOffsets(slidePerSide)

		const newRenderedSlides: RenderedSlideI[] = init
			? Array(totalRenderCount).fill(null)
			: renderedSlides.filter(({ slideIndex, dataIndex }) => {
					return dataIndex === -1 || Math.abs(slideIndex) <= slidePerSide
			  })
		const slideInfoMap: any = {}
		const newCenterSlideRelativeIndex = init
			? (totalRenderCount - 1) / 2
			: newRenderedSlides.findIndex(({ slideIndex }) => {
					return slideIndex === 0
			  })

		const newCenterDataIndex = init ? 0 : newRenderedSlides[newCenterSlideRelativeIndex]?.dataIndex

		let filledWidth = 0
		const centerPosition = carouselWidth / 2 - slideWidth / 2
		for (let absIndex = 0; absIndex <= slidePerSide; absIndex++) {
			const offset = offsets[absIndex]
			const slideScale = scales[absIndex]
			// @ts-ignore
			const currentOffSet = filledWidth + offset
			// @ts-ignore
			const absIdxArr = [-absIndex, absIndex]
			absIdxArr.forEach((slideIndex) => {
				const relativeIndex = newCenterSlideRelativeIndex + slideIndex
				const position = slideIndex >= 0 ? currentOffSet : -currentOffSet
				const opacity = absIndex === slidePerSide ? 0 : 1
				const dataIndex = modDataRange(newCenterDataIndex + slideIndex)

				newRenderedSlides[relativeIndex] = {
					dataIndex,
					scale: slideScale,
					position: position,
					slideIndex: slideIndex,
					opacity: opacity,
					zIndex: renderedSlidePerSide - Math.abs(slideIndex),
					key: init ? slideIndex : newRenderedSlides[relativeIndex].key,
				}

				slideInfoMap[slideIndex] = {
					position: position,
					scale: slideScale,
					opacity: opacity,
				}
			})
			if (absIndex !== 0) filledWidth += scaledOffsets[absIndex]
		}

		for (let i = -slidePerSide; i <= slidePerSide; i++) {
			slideInfoMap[i].maxTransformDistance = {}
			slideInfoMap[i].maxTransformScale = {}
			slideInfoMap[i].maxTransformOpacity = {
				left: i === -slidePerSide + 1 || i === slidePerSide ? 1 : 0,
				right: i === -slidePerSide || i === slidePerSide - 1 ? 1 : 0,
			}
			slideInfoMap[i].slideIndex = i

			if (i === -slidePerSide) {
				slideInfoMap[i].maxTransformDistance.left = 0
				slideInfoMap[i].maxTransformScale.left = 0
			} else {
				slideInfoMap[i].maxTransformDistance.left = slideInfoMap[i].position - slideInfoMap[i - 1].position
				slideInfoMap[i].maxTransformScale.left = Math.abs(slideInfoMap[i].scale - slideInfoMap[i - 1].scale)
			}
			if (i === slidePerSide) {
				slideInfoMap[i].maxTransformDistance.right = 0
				slideInfoMap[i].maxTransformScale.right = 0
			} else {
				slideInfoMap[i].maxTransformDistance.right = slideInfoMap[i + 1].position - slideInfoMap[i].position
				slideInfoMap[i].maxTransformScale.right = Math.abs(slideInfoMap[i + 1].scale - slideInfoMap[i].scale)
			}
		}

		// If the current slide to display is 5, but the previous slide to display is 7
		// which happens when user sets a break point for responsive reasons
		// we want to fill the 2 not displayed indices with some unique number
		if (maxVisibleSlide > currentVisibleSlides) {
			const maxRenderedSlidePerSide = (maxVisibleSlide + 1) / 2
			const currentSlidePerSide = slidePerSide
			for (let i = currentSlidePerSide + 1; i <= maxRenderedSlidePerSide; i++) {
				for (let direct = 1; direct >= 0; direct--) {
					const insertIndex = newCenterSlideRelativeIndex + (direct === 1 ? i : -i)
					const prevIndex = insertIndex + (direct === 1 ? -1 : 1)
					const slideIndex = direct === 1 ? i : -i
					const scalePositionIndex = init ? prevIndex : insertIndex
					newRenderedSlides[insertIndex] = {
						scale: newRenderedSlides[scalePositionIndex].scale,
						position: newRenderedSlides[scalePositionIndex].position,
						key: init ? -slideIndex : newRenderedSlides[insertIndex].key,
						dataIndex: -1,
						slideIndex,
						opacity: 0,
						zIndex: 0,
					}
				}
			}
		}

		const sortedSlideInfo = Object.values(slideInfoMap as slideInfoMapI)
		sortedSlideInfo.sort((slide1, slide2) => {
			return slide1.position - slide2.position
		})

		return {
			renderedSlides: newRenderedSlides,
			centerSlideRelativeIndex: newCenterSlideRelativeIndex,
			slideInfoMap,
			slidePerSide,
			newRenderedSlides,
			sortedSlideInfo,
			centerPosition,
			renderedSlidePerSide,
		}
	}

	const modDataRange = (n: number) => {
		const m = data.length
		return ((n % m) + m) % m
	}

	const calculateScaleAndOffsets = (slidePerSide: number) => {
		//calculate avaiable space
		const availableSpace = carouselWidth / 2 - slideWidth / 2
		//calculate sacle width
		const scales = [1]
		const scaledSlideWidths = [slideWidth]
		for (let slide = 1; slide <= slidePerSide; slide++) {
			const scale = customScales ? customScales[slide] : Math.pow(0.85, slide)
			scales.push(scale)
			scaledSlideWidths.push(slideWidth * scale)
		}

		//get includes scaleSlideWidth
		let includedSlideWidths = scaledSlideWidths.slice(1)
		let fillingSpace = availableSpace

		if (fadeDistance !== undefined) {
			includedSlideWidths = scaledSlideWidths.slice(1, slidePerSide)
			fillingSpace = availableSpace * (1 - fadeDistance)
		}
		const totalSlideWidth = includedSlideWidths.reduce((a, b) => a + b, 0)
		const offSetPercentage = totalSlideWidth ? fillingSpace / totalSlideWidth : 0

		const scaledOffsets = [0]
		const offsets = [0]
		for (let slide = 1; slide <= slidePerSide; slide++) {
			const isCustomFade = fadeDistance !== undefined && slide === slidePerSide
			const scale = scales[slide]
			scaledOffsets[slide] = isCustomFade
				? (fadeDistance as number) * availableSpace
				: slideWidth * scale * offSetPercentage
			offsets[slide] = scaledOffsets[slide] + slideWidth * ((1 - scale) / 2)
		}
		return { offsets, scaledOffsets, scales }
	}
	return <div>Gallery</div>
}

export default Gallery

