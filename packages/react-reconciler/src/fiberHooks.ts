import internals from 'shared/internals'
import { FiberNode } from './fiber'

interface Hook {
	memorizedState: any
	updateQueue: unknown
	next: Hook | null
}

let currentlyRenderingFiber: FiberNode | null = null
const workInProgressHook: Hook | null = null
const { currentDispatcher } = internals

export function renderWithHooks(wip: FiberNode) {
	// 赋值操作
	currentlyRenderingFiber = wip
	wip.memorizedState = null

	const current = wip.alternate

	if (current !== null) {
		// update
	} else {
		// mount
		// currentDispatcher.current = {}
	}

	const Component = wip.type
	const props = wip.pendingProps
	const children = Component(props)

	// 重置操作
	currentlyRenderingFiber = null

	return children
}
