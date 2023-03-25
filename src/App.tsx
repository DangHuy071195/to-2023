import React from 'react'
import './slide-show.style.scss'
import HorizontalSlideShow from './component/HorizontalSlideShow'
import Card from './component/Card'
import images from './component/HorizontalSlideShow/mock-data-img'

function App() {
	return (
		<div className='App'>
			<HorizontalSlideShow
				gutter={24}
				carouselWidth={1440}
				slideWidth={750}
				imgShow={5}
				maxVisibleSlide={5}
				slideComponent={Card}
				currentVisibleSlide={5}
				data={images}
			/>
		</div>
	)
}

export default App

