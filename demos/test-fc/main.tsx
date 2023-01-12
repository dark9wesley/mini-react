//@ts-nocheck
import { useState } from 'react'
import ReactDOM from 'react-dom/client'

const App = () => {
	const [num, setNum] = useState(100)
	window.setNum = setNum
	// return <div>{num}</div>
	return num === 3 ? <Child /> : num
}
const Child = () => <span>big react</span>

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<App />
)
