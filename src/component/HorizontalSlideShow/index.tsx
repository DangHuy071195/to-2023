import React, { useRef, useEffect, useState } from 'react'
import { slideInfoMapI, staticSlideInfo } from '../../interfaces'
import images, { ImageDataI } from './mock-data-img'

export interface renderedSlide {
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
	gutter: number
	carouselWidth: number
	imgShow: number
	customScales?: number[]
	fadeDistance?: number
	maxVisibleSlide: number
	currentVisibleSlide: number
	customTransition?: any
	slideComponent: any
}

const HorizontalSlideShow: React.FC<HorizontalSlideShowProps> = ({
	slideWidth,
	gutter,
	carouselWidth,
	currentVisibleSlide,
	customScales,
	fadeDistance,
	maxVisibleSlide,
	currentVisibleSlide: currentVisibleDisplaySlide,
	customTransition,
	slideComponent: Component,
}) => {
	const listContainerRef = useRef<HTMLUListElement | null>(null)
	const [totalWidth, setTotalWidth] = useState(0)
	const [dataImgs, setDataImgs] = useState(images)
	const [count, setCount] = useState(0)
	const [init, setInit] = useState(true)
	const [renderedSlides, setRenderedSlides] = useState<renderedSlide[]>([])
	const [slideInfoMap, setSlideInfoMap] = useState<any>()
	const [sortedSlideInfo, setSortedSlideInfo] = useState<staticSlideInfo[]>([])
	const [slidePerSide, setSlidePerSide] = useState(0)
	const [height, setHeight] = useState(0)
	const [keyCount, setKeyCount] = useState(dataImgs.length)
	const [addedSlide, setAddedSlide] = useState(0)
	const [centerPosition, setCenterPosition] = useState(0)
	const [maxZIndex, setMaxZIndex] = useState(100)
	const [renderedSlidePerSide, setRenderedSlidePerSide] = useState(0)
	const [tempShift, setTempShift] = useState(false)
	const [swipeStarted, setSwipeStarted] = useState(false)

	const [swipRight, setSwipRight] = useState(false)

	const initializeProperties = () => {
		const imgs = Array.from(listContainerRef.current!.children)
		// const imgWidth = imgs[0].getBoundingClientRect().width
		imgs.forEach((img: any, idx: number) => {
			// img.style.left = imgWidth * idx + gutter + 'px'
			// img.style.left = imgWidth * idx + 'px'
		})

		// dataImgs.map((img: any, idx: number) => {
		// 	const countPerSide = (imgShow - 1) / 2
		// 	console.log('calculateScaleAndOffsets', calculateScaleAndOffsets(countPerSide))
		// 	return {
		// 		slideIdx: idx - countPerSide,
		// 		dataIndex: idx,
		// 	}
		// })

		const currentVisibleSlides = currentVisibleDisplaySlide || maxVisibleSlide
		const visibleSlidePerSide = (currentVisibleSlides - 1) / 2
		const slidePerSide = Math.max(visibleSlidePerSide + 1, 1)
		const totalRenderCount = maxVisibleSlide + 2
		const renderedSlidePerSide = (maxVisibleSlide + 1) / 2
		const { offsets, scaledOffsets, scales } = calculateScaleAndOffsets(slidePerSide)

		const newRenderedSlides: renderedSlide[] = init
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
			const currentOffSet = filledWidth + offset

			;[-absIndex, absIndex].forEach((slideIndex) => {
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
	useEffect(() => {
		const { renderedSlides, slideInfoMap, slidePerSide, sortedSlideInfo, centerPosition, renderedSlidePerSide } =
			initializeProperties()
		setRenderedSlides(renderedSlides)
		setSlideInfoMap(slideInfoMap)
		setSortedSlideInfo(sortedSlideInfo)
		setSlidePerSide(slidePerSide)
		setCenterPosition(centerPosition)
		setRenderedSlidePerSide(renderedSlidePerSide)
	}, [])

	const calculateScaleAndOffsets = (slidePerSide: number) => {
		const availableSpace = carouselWidth / 2 - slideWidth / 2
		const scales = [1]
		const scaledSlideWidths = [slideWidth]
		for (let slide = 1; slide <= slidePerSide; slide++) {
			const scale = customScales ? customScales[slide] : Math.pow(0.85, slide)
			scales.push(scale)
			scaledSlideWidths.push(slideWidth * scale)
		}
		console.log('scaledSlideWidths', scaledSlideWidths)

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

	function moveElement(array: any[], fromIndex: number, toIndex: number) {
		const arrayCopy = [...array]
		const element = arrayCopy.splice(fromIndex, 1)[0]

		console.log(element)

		arrayCopy.splice(toIndex, 0, element)

		return arrayCopy
	}

	const slideShowClickHandler = (e: any) => {
		setCount((state) => ++state)
		listContainerRef.current!.style.transform = `translateX(0)`
		const targetImg = e.target.closest('li')
		console.log('targetImg', targetImg)
		const targetIdx = Array.from(listContainerRef!.current!.children).findIndex((img) => img === targetImg)
		console.log('targetImg', targetImg)
		if (!targetImg) return
		const currentImg = listContainerRef.current?.querySelector('.current--img')
		const curIdx = Array.from(listContainerRef!.current!.children).findIndex((img) => img === currentImg)

		moveToImg(listContainerRef, currentImg, targetImg, targetIdx, curIdx)
		// setDataImgs(newArray!)
	}

	const moveToImg = (list: any, currentImg: any, targetImg: any, targetIdx: number, curIdx: number) => {
		// let leftCount = ''
		// if (count === 0) {
		// 	leftCount = `${(targetImg!.style.left.replace('px', '') - (targetIdx - curIdx) * imgWidth) / 2}px`
		// } else {
		// 	leftCount = `${targetImg!.style.left.replace('px', '') / 2 - (targetIdx - curIdx) * imgWidth}px`
		// }
		// list.current!.style.transform = `translateX(-${leftCount})`
		// list.current!.style.transform = `translateX(-${(listContainerRef!.current!.getBoundingClientRect().width) / 2})`
		// list.current!.style.transform = `translateX(-${listContainerRef!.current!.getBoundingClientRect().width / 2})`
		// targetImg.style.transform = `scale(1.15)`
		const imgs = Array.from(listContainerRef.current!.children)

		imgs.forEach((img) => {
			console.log('img', img)
		})
		// dataImgs.forEach((img, idx) => {
		// 	if (imgShow < dataImgs.length && targetIdx > curIdx) {
		// 		// newArray = moveElement(dataImgs, idx, dataImgs.length - idx - 1)
		// 		//@ts-ignore
		// 		imgs[idx].style.right = imgWidth * (idx + 1) + 'px'
		// 		// dataImgs.splice(dataImgs.length - idx - 1, 0, dataImgs.splice(idx, 1)[0])
		// 	}
		// })

		// setDataImgs(dataImgsUpdate)

		// targetImg.style.transform = `translateX(50%)`
		// targetImg.style.left = `50%`

		currentImg?.classList.remove('current--img')
		targetImg?.classList.add('current--img')
	}

	const modDataRange = (n: number) => {
		const m = dataImgs.length
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

	const moveCarousel = (steps: number, disableSwipeRightState: boolean = false) => {
		let newCenterDataIndex = 0

		const newSlides = renderedSlides.map((oldSlide) => {
			const { slideIndex, dataIndex } = oldSlide
			if (dataIndex === -1) return oldSlide
			if (slideIndex === 0) newCenterDataIndex = modDataRange(dataIndex + steps)

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

		setSwipeStarted(false)
		setRenderedSlides(newSlides)
		setSwipRight(disableSwipeRightState ? false : steps < 0 ? true : false)
	}

	return (
		<div className='slide-show'>
			{/* @ts-ignore */}
			<div className='slide-show__img--container'>
				{console.log('dataImgs', dataImgs)}

				<ul className='slide-show__img--container__list' ref={listContainerRef} onClick={slideShowClickHandler}>
					{renderedSlides.map(({ opacity, slideIndex, dataIndex, position, scale, key, zIndex }) => {
						const ID = dataIndex === -1 ? `hidden-${key}` : slideIndex
						const zDuration = 450 * (swipRight ? 0.6 : 1)

						const transition = swipeStarted
							? 'none'
							: customTransition || `all ${450}ms ease, z-index ${zDuration}ms ease`
						const isCenterSlide = tempShift ? zIndex === maxZIndex : slideIndex === 0
						return (
							<div
								key={key}
								className={`react-stacked-center-carousel-slide-${ID}`}
								draggable={false}
								onClick={() => {
									console.log('slideIndex', slideIndex)
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
								}}>
								{dataIndex !== -1 && (
									<Component
										dataIndex={dataIndex}
										data={dataImgs}
										slideIndex={slideIndex}
										isCenterSlide={isCenterSlide}
										swipeTo={swipeTo}
									/>
								)}
							</div>
						)
					})}
					{/* {images.map((img: ImageDataI, idx: number) => (
						<li
							key={idx}
							className={`slide-show__img--container__list--item ${idx === currentImageIdx ? 'current--img' : ''}`}>
							<img src={img.url} alt='' />
						</li>
					))} */}
				</ul>
			</div>
		</div>
	)
}

export default HorizontalSlideShow

