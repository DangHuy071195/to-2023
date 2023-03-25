import React, { useCallback, useEffect, useRef, useState } from 'react'
import { slideInfoMapI } from '../../interfaces'
import Information from '../Card/Information'
import { ImageDataI } from './mock-data-img'

export interface RenderedSlideI {
	position: number
	dataIndex: number
	scale: number
	slideIndex: number
	opacity: number
	key: number
	zIndex: number
}

interface HorizontalSlideShowProps {
	slideWidth: number
	carouselWidth: number
	customScales?: number[]
	fadeDistance?: number
	maxVisibleSlide: number
	currentVisibleSlide: number
	customTransition?: any
	slideComponent: any
	data: ImageDataI[]
	height?: number
	ref: any
}

const HorizontalSlideShow: React.FC<HorizontalSlideShowProps> = (props) => {
	const {
		slideWidth,
		carouselWidth,
		customScales,
		fadeDistance,
		maxVisibleSlide,
		currentVisibleSlide: currentVisibleDisplaySlide,
		customTransition,
		slideComponent: Component,
		data,
		height,
	} = props

	const listContainerRef = useRef<HTMLUListElement | null>(null)

	const [init] = useState(true)
	const [renderedSlides, setRenderedSlides] = useState<RenderedSlideI[]>([])
	const [slideInfoMap, setSlideInfoMap] = useState<any>()
	const [slidePerSide, setSlidePerSide] = useState(0)
	const [keyCount, setKeyCount] = useState(data.length)
	const [addedSlide, setAddedSlide] = useState(0)
	const [renderedSlidePerSide, setRenderedSlidePerSide] = useState(0)
	const [listHeight, setListHeight] = useState(height || 0)
	const [currentSlideCenter, setCurrentSlideCenter] = useState<RenderedSlideI>()

	const initializeProperties = useCallback(() => {
		const currentVisibleSlides = currentVisibleDisplaySlide || maxVisibleSlide
		const visibleSlidePerSide = (currentVisibleSlides - 1) / 2
		const slidePerSide = Math.max(visibleSlidePerSide + 1, 1)
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
		for (let absIndex = 0; absIndex <= slidePerSide; absIndex++) {
			const offset = offsets[absIndex]
			const slideScale = scales[absIndex]
			const currentOffSet = filledWidth + offset
			const absArr = [-absIndex, absIndex]
			absArr.forEach((slideIndex) => {
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
					key: init ? slideIndex : newRenderedSlides[relativeIndex]?.key,
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

		setRenderedSlides(newRenderedSlides)
		setSlideInfoMap(slideInfoMap)
		setSlidePerSide(slidePerSide)
		setRenderedSlidePerSide(renderedSlidePerSide)
	}, [carouselWidth, currentVisibleDisplaySlide, maxVisibleSlide, slideWidth])

	const calculateScaleAndOffsets = (slidePerSide: number) => {
		const availableSpace = (carouselWidth - slideWidth) / 2
		const scales = []
		const scaledSlideWidths = [slideWidth]
		for (let slide = 1; slide <= slidePerSide; slide++) {
			const scale = customScales ? customScales[slide] : Math.pow(0.75, slide)
			scales.push(scale)
			scaledSlideWidths.push(slideWidth * scale)
		}

		let withoutCenterSlideWidths = scaledSlideWidths.slice(1)
		let fillingSpace = availableSpace
		if (fadeDistance !== undefined) {
			withoutCenterSlideWidths = scaledSlideWidths.slice(1, slidePerSide)
			fillingSpace = availableSpace * (1 - fadeDistance)
		}

		const totalSlideWidth = withoutCenterSlideWidths.reduce((a, b) => a + b, 0)
		const offSetPercentage = totalSlideWidth ? fillingSpace / totalSlideWidth : 0

		const scaledOffsets = [0]
		const offsets = [0]
		for (let slide = 1; slide <= slidePerSide; slide++) {
			const isCustomFade = fadeDistance !== undefined && slide === slidePerSide
			const scale = scales[slide]
			scaledOffsets[slide] = isCustomFade ? fadeDistance * availableSpace : slideWidth * scale * offSetPercentage
			offsets[slide] = scaledOffsets[slide] + slideWidth * ((1 - scale) / 2)
		}
		return { offsets, scaledOffsets, scales }
	}

	const modDataRange = (n: number) => {
		const m = data.length
		return ((n % m) + m) % m
	}

	const safeGetSlideInfo = (slideIndex: number) => {
		let positionIndex = slideIndex
		if (positionIndex > slidePerSide) {
			positionIndex = slidePerSide
		} else if (positionIndex < -slidePerSide) {
			positionIndex = -slidePerSide
		}
		return slideInfoMap && slideInfoMap[positionIndex]
	}

	const getInsertionInfo = (steps: number) => {
		const newAddedSlideIndex = steps > 0 ? slidePerSide - steps + 1 : -slidePerSide - steps - 1
		const targetSlideIndex = steps > 0 ? slidePerSide : -slidePerSide
		const requireMoreSlide = (current: number, target: number) => {
			return steps > 0 ? current <= target : current >= target
		}
		const updateCount = steps > 0 ? 1 : -1
		return {
			newAddedSlideIndex,
			targetSlideIndex,
			requireMoreSlide,
			updateCount,
		}
	}

	const getZIndex = (slideIndex: number) => {
		return renderedSlidePerSide - Math.abs(slideIndex)
	}

	const swipeTo = () => {}

	const moveCarousel = (steps: number) => {
		const newSlides = renderedSlides.map((oldSlide) => {
			const { slideIndex, dataIndex } = oldSlide
			if (dataIndex === -1) return oldSlide
			const newSlideIndex = slideIndex + -steps
			const slideInfo: any = safeGetSlideInfo(newSlideIndex)
			return {
				...oldSlide,
				slideIndex: newSlideIndex,
				position: slideInfo?.position,
				scale: slideInfo?.scale,
				opacity: slideInfo?.opacity,
				zIndex: getZIndex(newSlideIndex),
			}
		})
		if (steps !== 0) {
			const maxSlideIndex = steps > 0 ? slidePerSide : -slidePerSide
			setAddedSlide(Math.abs(steps))
			const insertionInfo = getInsertionInfo(steps)
			let { newAddedSlideIndex } = insertionInfo
			const { requireMoreSlide, updateCount, targetSlideIndex } = insertionInfo

			while (requireMoreSlide(newAddedSlideIndex, targetSlideIndex)) {
				// eslint-disable-next-line no-loop-func
				const slideAlreadyExist = newSlides.find(({ slideIndex }) => slideIndex === newAddedSlideIndex)
				if (!slideAlreadyExist) {
					// eslint-disable-next-line no-loop-func
					const insertPosition = newSlides.findIndex(({ slideIndex, dataIndex }) => {
						return slideIndex === newAddedSlideIndex - updateCount && dataIndex !== -1
					})
					let scale, position
					if (slideInfoMap && slideInfoMap[maxSlideIndex]) {
						scale = slideInfoMap[maxSlideIndex].scale
						position = slideInfoMap[maxSlideIndex].position
					}
					const insertDataIndex = modDataRange(newSlides[insertPosition].dataIndex + updateCount)
					setKeyCount(keyCount + 1)
					const zIndex = getZIndex(newAddedSlideIndex)
					const insertSlide = {
						scale,
						position,
						opacity: 0,
						zIndex: zIndex - addedSlide,
						slideIndex: newAddedSlideIndex,
						dataIndex: insertDataIndex,
						key: keyCount,
					}

					newSlides.splice(steps > 0 ? insertPosition + 1 : insertPosition, 0, insertSlide)
				}
				newAddedSlideIndex += updateCount
			}
		}

		setRenderedSlides(newSlides)
	}

	const updateHeight = () => {
		const slideItemImg = listContainerRef!.current?.querySelector('.horizontal-slide-item-0')?.children[0]?.children[0]
		const slideItemInfo = listContainerRef!.current?.querySelector('.horizontal-slide-item-0')?.children[0]?.children[1]
		let slideItemHeightInfo = 0,
			slideItemHeightImg = 0
		if (slideItemImg) {
			slideItemHeightImg = parseInt(window.getComputedStyle(slideItemImg! as Element).height)
		}
		if (slideItemInfo) {
			slideItemHeightInfo = parseInt(window.getComputedStyle(slideItemInfo! as Element).height)
		}

		setListHeight(slideItemHeightImg! + slideItemHeightInfo)
	}

	useEffect(() => {
		if (renderedSlides) {
			updateHeight()
			setCurrentSlideCenter(renderedSlides.find(({ slideIndex }) => slideIndex === 0))
		}
	}, [renderedSlides])

	useEffect(() => {
		initializeProperties()
	}, [initializeProperties])

	return (
		<div className='slide-show'>
			<ul
				className='slide-show__img--container__list'
				ref={listContainerRef}
				style={{
					width: carouselWidth,
					height: listHeight + 300,
					position: 'relative',
					overflow: 'hidden',
					cursor: 'pointer',
				}}>
				{renderedSlides.map(({ opacity, slideIndex, dataIndex, position, scale, key, zIndex }) => {
					const ID = dataIndex === -1 ? `hidden-${key}` : slideIndex
					const transition = customTransition || `all ${450}ms ease-in-out, z-index ${450}ms ease-in-out`
					const isCenterSlide = slideIndex === 0
					return (
						<div
							key={key}
							className={`horizontal-slide-item-${ID}`}
							onClick={() => {
								console.log('slideIndex')
								moveCarousel(slideIndex)
							}}
							style={{
								position: 'absolute',
								display: 'flex',
								left: `calc(50% - ${slideWidth / 2}px)`,
								transform: `translateX(${position}px) scale(${scale})`,
								width: slideWidth,
								transition,
								opacity,
								zIndex,
								height: listHeight,
							}}>
							{dataIndex !== -1 && (
								<Component
									dataIndex={dataIndex}
									data={data}
									slideIndex={slideIndex}
									isCenterSlide={isCenterSlide}
									swipeTo={swipeTo}
									zIndex={zIndex}
								/>
							)}
						</div>
					)
				})}
			</ul>
			<Information
				title={currentSlideCenter ? data[currentSlideCenter!['dataIndex']].title : ''}
				items={currentSlideCenter ? data[currentSlideCenter!['dataIndex']].children : []}
			/>
		</div>
	)
}

export default HorizontalSlideShow

