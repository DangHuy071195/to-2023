import React, { useRef, useEffect, useState } from 'react'
import images, { ImageDataI } from './mock-data-img'

interface HorizontalSlideShowProps {
	currentVisibleSlide: number
	maxVisibleSlide: number
	// fadeDistance: number
	data: any
	slideWidth: number
	carouselWidth: number
}
const HorizontalSlideShow: React.FC<HorizontalSlideShowProps> = (props) => {
	const listContainerRef = useRef<HTMLUListElement | null>(null)
	const [data, setData] = useState(images)
	const { currentVisibleSlide: currentVisibleDisplaySlide, maxVisibleSlide, slideWidth } = props
	useEffect(() => {
		// const imgs = Array.from(listContainerRef.current!.children)
		// const imgWidth = imgs[0].getBoundingClientRect().width
		// setTotalWidth(imgShow * imgWidth)
		// console.log('imgWidth', imgWidth)
		// imgs.forEach((img: any, idx: number) => {
		// 	// img.style.left = imgWidth * idx + gutter + 'px'
		// 	img.style.left = imgWidth * idx + 'px'
		// })
		if (data.length < (maxVisibleSlide + 1) / 2) {
			throw Error('you must have more than (maxVisibleSlide + 1) / 2 data item')
		}
		if ((currentVisibleDisplaySlide && currentVisibleDisplaySlide % 2 !== 1) || maxVisibleSlide % 2 !== 1) {
			throw Error('currentVisibleSlide or maxVisibleSlide must be an odd number')
		}
		if (currentVisibleDisplaySlide && currentVisibleDisplaySlide > maxVisibleSlide) {
			throw Error('currentVisibleSlide must be smaller than maxVisibleSlide')
		}
		const currentVisibleSlides = currentVisibleDisplaySlide || maxVisibleSlide
	}, [])

	// function moveElement(array: any[], fromIndex: number, toIndex: number) {
	// 	const arrayCopy = [...array]
	// 	const element = arrayCopy.splice(fromIndex, 1)[0]

	// 	console.log(element)

	// 	arrayCopy.splice(toIndex, 0, element)

	// 	return arrayCopy
	// }

	const slideShowClickHandler = (e: any) => {
		listContainerRef.current!.style.transform = `translateX(0)`
		const targetImg = e.target.closest('li')
		console.log('targetImg', targetImg)
		const targetIdx = Array.from(listContainerRef!.current!.children).findIndex((img) => img === targetImg)
		console.log('targetImg', targetImg)
		if (!targetImg) return
		const currentImg = listContainerRef.current?.querySelector('.current--img')
		const curIdx = Array.from(listContainerRef!.current!.children).findIndex((img) => img === currentImg)

		// setDataImgs(newArray!)
	}

	return (
		<div className='slide-show'>
			{/* @ts-ignore */}
			<div className='slide-show__img--container'>
				<ul className='slide-show__img--container__list' ref={listContainerRef} onClick={slideShowClickHandler}>
					{images.map((img: ImageDataI, idx: number) => (
						<li key={idx} className={`slide-show__img--container__list--item `}>
							<img src={img.url} alt='' />
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}

export default HorizontalSlideShow
