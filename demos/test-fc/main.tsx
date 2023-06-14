import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'

const App = () => {
	const [num] = useState(100)
	return (
		<div>
			{/* <Child /> */}
			{num}
		</div>
	)
}

const Child = () => {
	return <span>mini-react</span>
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<App />
)
