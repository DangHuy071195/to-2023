import React from 'react'
import './slide-show.style.scss'
import HorizontalSlideShow from './component/HorizontalSlideShow'
import images from './component/HorizontalSlideShow/mock-data-img'

function App() {
	return (
		<div className='App'>
			<HorizontalSlideShow
				data={images}
				slideWidth={64}
				carouselWidth={300}
				maxVisibleSlide={5}
				currentVisibleSlide={5}
			/>
		</div>
	)
}

export default App
