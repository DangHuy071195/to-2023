import React, { useEffect, useState } from 'react'

const Card = React.memo(
	function (props: any) {
		const { data, dataIndex } = props
		const [url, setUrl] = useState()

		const [title, setTitle] = useState('')

		useEffect(() => {
			if (data && data[dataIndex]) {
				const { url, title } = data[dataIndex]
				setUrl(url)
				setTitle(title)
			}
		}, [data, dataIndex])

		return (
			<div
				style={{
					width: '100%',
					height: 64,
					userSelect: 'none',
					display: 'flex',
					justifyContent: 'center',
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
					src={url ?? ''}
					alt={title}
				/>
			</div>
		)
	},
	function (prev: any, next: any) {
		return prev.dataIndex === next.dataIndex
	}
)

export default Card

