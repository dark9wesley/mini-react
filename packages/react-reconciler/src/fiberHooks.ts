import internals from 'shared/internals'
import { FiberNode } from './fiber'

let currentlyRenderingFiber: FiberNode | null = null

const workInProgressHook: Hook | null = null

interface Hook {
	memorizedState: any
	updateQueue: unknown
	next: Hook | null
}

const { currentDispatcher } = internals

export function renderWithHooks(wip: FiberNode) {
	// 赋值
	currentlyRenderingFiber = wip
	wip.memorizeState = null

	const current = wip.alternate

	if (current !== null) {
		//update
	} else {
		//mount时的hook实现
		// currentDispatcher.current =
	}

	const Component = wip.type
	const props = wip.pendingProps
	const children = Component(props)
	// 重置
	currentlyRenderingFiber = null
	return children
}
