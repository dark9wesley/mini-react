import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'

const App = () => {
	return (
		<div>
			{/* 1 Fragment包裹其他组件 */}
			{/* <>
				<div>1</div>
				<div>2</div>
			</> */}

			{/* 2 Fragment与其他组件同级 */}
			{/* <ul>
				<>
					<li>1</li>
					<li>2</li>
				</>
				<li>3</li>
				<li>4</li>
			</ul> */}

			{/* 3 数组形式Fragment */}
			<ul>
				{[<li>1</li>, <li>2</li>]}
				<li>3</li>
				<li>4</li>
			</ul>
		</div>
	)
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<App />
)
