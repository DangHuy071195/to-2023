import React, { useRef, useEffect, useState } from 'react'
import images, { ImageDataI } from './mock-data-img'

interface HorizontalSlideShowProps {
	imgWidth: number
	gutter: number
	listWidth: number
	imgShow: number
}
const HorizontalSlideShow: React.FC<HorizontalSlideShowProps> = ({ imgWidth, gutter, listWidth, imgShow }) => {
	const listContainerRef = useRef<HTMLUListElement | null>(null)
	const [currentImageIdx, setCurrentImageIdx] = useState(Math.ceil(imgShow / 2) - 1)
	const [totalWidth, setTotalWidth] = useState(0)
	const [dataImgs, setDataImgs] = useState(images)
	const [count, setCount] = useState(0)

	useEffect(() => {
		const imgs = Array.from(listContainerRef.current!.children)
		const imgWidth = imgs[0].getBoundingClientRect().width
		setTotalWidth(imgShow * imgWidth)
		console.log('imgWidth', imgWidth)
		imgs.forEach((img: any, idx: number) => {
			// img.style.left = imgWidth * idx + gutter + 'px'
			img.style.left = imgWidth * idx + 'px'
		})
	}, [])

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
		console.log('Math.ceil(imgShow / 2)')
		setCurrentImageIdx(Math.ceil(imgShow / 2))
		console.log('targetImg!.style.left', targetImg!.style.left)
		console.log('targetIdx', targetIdx)
		console.log('curIdx', curIdx)
		console.log('sadas', targetImg!.style.left.replace('px', ''))
		let leftCount = ''
		if (count === 0) {
			leftCount = `${(targetImg!.style.left.replace('px', '') - (targetIdx - curIdx) * imgWidth) / 2}px`
		} else {
			leftCount = `${targetImg!.style.left.replace('px', '') / 2 - (targetIdx - curIdx) * imgWidth}px`
		}
		list.current!.style.transform = `translateX(-${leftCount})`
		// list.current!.style.transform = `translateX(-${(listContainerRef!.current!.getBoundingClientRect().width) / 2})`
		// list.current!.style.transform = `translateX(-${listContainerRef!.current!.getBoundingClientRect().width / 2})`
		// targetImg.style.transform = `scale(1.15)`
		const imgs = Array.from(listContainerRef.current!.children)
		dataImgs.forEach((img, idx) => {
			if (imgShow < dataImgs.length && targetIdx > curIdx) {
				// newArray = moveElement(dataImgs, idx, dataImgs.length - idx - 1)
				//@ts-ignore
				imgs[idx].style.right = imgWidth * (idx + 1) + 'px'
				// dataImgs.splice(dataImgs.length - idx - 1, 0, dataImgs.splice(idx, 1)[0])
			}
		})

		// setDataImgs(dataImgsUpdate)

		// targetImg.style.transform = `translateX(50%)`
		// targetImg.style.left = `50%`

		currentImg?.classList.remove('current--img')
		targetImg?.classList.add('current--img')
	}

	return (
		<div className='slide-show'>
			{/* @ts-ignore */}
			<div className='slide-show__img--container' style={{ width: totalWidth }}>
				{console.log('dataImgs', dataImgs)}

				<ul className='slide-show__img--container__list' ref={listContainerRef} onClick={slideShowClickHandler}>
					{images.map((img: ImageDataI, idx: number) => (
						<li
							key={idx}
							className={`slide-show__img--container__list--item ${idx === currentImageIdx ? 'current--img' : ''}`}>
							<img src={img.url} alt='' />
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}

export default HorizontalSlideShow
