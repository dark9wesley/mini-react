import { FiberNode } from './fiber'

let currentlyRenderingFiber: FiberNode | null = null

export function renderWithHooks(wip: FiberNode) {
	// 赋值
	currentlyRenderingFiber = wip
	const Component = wip.type
	const props = wip.pendingProps
	const children = Component(props)
	// 重置
	currentlyRenderingFiber = null
	return children
}
