import React from 'react'
import './slide-show.style.scss'
import HorizontalSlideShow from './component/HorizontalSlideShow'

function App() {
	return (
		<div className='App'>
			<HorizontalSlideShow listWidth={500} gutter={24} imgWidth={64} imgShow={5} />
		</div>
	)
}

export default App

