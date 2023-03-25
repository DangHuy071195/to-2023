import React, { useEffect, useState } from 'react'
import Information from './Information'

const Card = React.memo(
	function (props: any) {
		const { data, dataIndex } = props
		const [cover, setCover] = useState('')
		const [items, setItems] = useState([])
		const [title, setTitle] = useState('')

		useEffect(() => {
			if (data && data[dataIndex]) {
				const { cover, children, title } = data[dataIndex]
				setCover(cover)
				setItems(children)
				setTitle(title)
			}
		}, [])

		return (
			<div
				style={{
					width: '100%',
					// height: 64,
					userSelect: 'none',
					position: 'relative',
				}}
				className='slide-item-content'>
				<img
					style={{
						height: '100%',
						width: '100%',
						objectFit: 'cover',
						borderRadius: 0,
					}}
					draggable={false}
					src={cover ?? ''}
					alt='asds'
				/>
				{<Information title={title} items={items} />}
			</div>
		)
	},
	function (prev: any, next: any) {
		return prev.dataIndex === next.dataIndex
	}
)

export default Card

