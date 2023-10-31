import React from 'react'
import RenderStars, { renderStars } from './stars'

export default async function Card(props) {
	return (
		<div className="flex flex-col justify-center gap-1 hover:opacity-70 transition-opacity">
			<img
				src={props.image}
				alt="Product Photo"
				className="w-full h-80 object-cover mb-2 rounded-lg"
			/>
			<h1 className="text-xl font-semibold mb-2">{props.name}</h1>

			{props.rating && <RenderStars rating={props.rating}></RenderStars>}
			{props.price && (
				<p className="text-gray-700 text-lg">R${props.price.toFixed(2)}</p>
			)}
		</div>
	)
}
