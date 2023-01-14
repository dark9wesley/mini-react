//@ts-nocheck
import { useState } from 'react'
import ReactDOM from 'react-dom/client'

const App = () => {
	const [num, setNum] = useState(100)
	window.setNum = setNum
	// return num === 3 ? <Child /> : num
	return <span onClickCapture={() => setNum((num) => num + 1)}>{num}</span>
}
const Child = () => <span>big react</span>

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<App />
)
