import React from 'react'
interface InfoProps {
	title: string
	items: string[]
}
const Information: React.FC<InfoProps> = ({ title, items }) => {
	return (
		<div className='information'>
			<h3 className='information__title'>{title}</h3>
			<ul className='information__list'>
				{items?.map((str) => (
					<li>{str}</li>
				))}
			</ul>
		</div>
	)
}

export default Information

