import React from 'react'
import HorizontalSlideShow from './component/HorizontalSlideShow'
import Card from './component/Card'
import ResponsiveContainer from './component/HorizontalSlideShow/ReponsiveContainer'
import { mockImages } from './component/HorizontalSlideShow/mock-data-img'
import Typewriter from 'typewriter-effect'

import './main.style.scss'

function App() {
	const ref = React.useRef<typeof HorizontalSlideShow>()
	return (
		<div className='container'>
			<div className='typewriter'>
				<Typewriter
					options={{
						strings: ['Horizontal Slide show', 'Responsive'],
						autoStart: true,
						loop: true,
					}}
				/>
			</div>
			<ResponsiveContainer
				carouselRef={ref}
				render={(width: any, carouselRef: any) => {
					console.log('width in render...', width)
					let currentVisibleSlide = 5
					if (width <= 410) currentVisibleSlide = 3
					return (
						<HorizontalSlideShow
							ref={carouselRef}
							carouselWidth={width}
							slideWidth={64}
							maxVisibleSlide={5}
							slideComponent={Card}
							currentVisibleSlide={currentVisibleSlide}
							data={mockImages}
							fadeDistance={0.5}
						/>
					)
				}}
			/>
		</div>
	)
}

export default App

