import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'

const App = () => {
	const [num, setNum] = useState(100)
	window.setNum = setNum
	return (
		<div>
			{/* <Child /> */}
			{num === 3 ? <Child /> : num}
		</div>
	)
}

const Child = () => {
	return <span>mini-react</span>
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<App />
)
