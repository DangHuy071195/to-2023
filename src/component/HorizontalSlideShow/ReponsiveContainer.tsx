import React from 'react'
import { useResizeDetector } from 'react-resize-detector'
interface ResponsiveContainerProps {
	carouselRef: any
	render: any
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = (props) => {
	const { render, carouselRef } = props
	const { width, ref } = useResizeDetector()
	console.log('width', width, 'ref', ref)

	return (
		<div className='slide-show__img--container' ref={ref}>
			{width && render(width, carouselRef)}
		</div>
	)
}

export default ResponsiveContainer

