import React, { useEffect, useState } from 'react'

const Card = React.memo(
	function (props: any) {
		const { data, dataIndex } = props
		const [cover, setCover] = useState('')

		useEffect(() => {
			if (data[dataIndex]) {
				const { cover } = data[dataIndex]
				setCover(cover)
			}
		})
		return (
			<div
				style={{
					width: '100%',
					height: 64,
					userSelect: 'none',
				}}
				className='my-slide-component'>
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
			</div>
		)
	},
	function (prev: any, next: any) {
		return prev.dataIndex === next.dataIndex
	}
)

export default Card

