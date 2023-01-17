//@ts-nocheck
import { useState } from 'react'
import ReactDOM from 'react-dom/client'

const App = () => {
	const [num, setNum] = useState(100)
	const arr =
		num % 2 === 0
			? [<li key="1">1</li>, <li key="2">2</li>, <li key="3">3</li>]
			: [<li key="3">3</li>, <li key="2">2</li>, <li key="1">1</li>]
	window.setNum = setNum
	// return num === 3 ? <Child /> : num
	return <ul onClickCapture={() => setNum((num) => num + 1)}>{arr}</ul>
}
const Child = () => <span>big react</span>

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<App />
)
