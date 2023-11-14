import React from 'react'
import ReactNoopRender from 'react-noop-renderer'

const App = () => {
	return (
		<>
			<Child />
			<div>hello world</div>
		</>
	)
}

const Child = () => {
	return 'child'
}

const root = ReactNoopRender.createRoot()

root.render(<App />)

// @ts-ignore
window.root = root
