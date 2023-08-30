import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'

const App = () => {
	const [num, setNum] = useState(100)

	return (
		<div>
			{/* <Child /> */}
			{/* {num === 3 ? <Child /> : num} */}
			<div onClick={() => setNum(num + 1)}>{num}</div>
		</div>
	)
}

const Child = () => {
	return <span>mini-react</span>
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<App />
)
