import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'

const App = () => {
	const [num, updateNum] = useState(0)

	useEffect(() => {
		console.log('App mount')
	}, [])

	useEffect(() => {
		console.log('num change create', num)

		return () => {
			console.log('num change destroy', num)
		}
	}, [num])

	return (
		<div
			onClick={() => {
				updateNum(num + 1)
			}}
		>
			{num === 0 ? <Child /> : 'noop'}
		</div>
	)
}

const Child = () => {
	useEffect(() => {
		console.log('Child mount')

		return () => {
			console.log('Child unmount')
		}
	}, [])
	return <span>I am Child</span>
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<App />
)
