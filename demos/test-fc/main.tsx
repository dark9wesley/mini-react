//@ts-nocheck
import React from 'react'
import ReactDOM from 'react-dom/client'

const App = () => (
	<div>
		<Child />
	</div>
)
const Child = () => <span>big react</span>

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<App />
)
