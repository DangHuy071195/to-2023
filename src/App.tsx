import React from 'react'
import './slide-show.style.scss'
import HorizontalSlideShow from './component/HorizontalSlideShow'
import Card from './component/Card'

function App() {
	return (
		<div className='App'>
			<HorizontalSlideShow
				gutter={24}
				carouselWidth={1440}
				slideWidth={64}
				imgShow={5}
				maxVisibleSlide={5}
				slideComponent={Card}
				currentVisibleSlide={5}
			/>
		</div>
	)
}

export default App

