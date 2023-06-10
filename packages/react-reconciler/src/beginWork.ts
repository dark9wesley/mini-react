import { ReactElement } from 'shared/ReactTypes'
import { FiberNode } from './fiber'
import { UpdateQueue, processUpdateQueue } from './updateQueue'
import { HostComponent, HostRoot, HostText } from './workTags'
import { mountChildFibers, reconcileChildFibers } from './childFiber'

// 递归中的“递”阶段
export const beginWork = (wip: FiberNode) => {
	// 比较，返回子FiberNode
	// 比较子reactElement和current树Fiber，生成新的子Fiber
	switch (wip.tag) {
		case HostRoot:
			return updateHostRoot(wip)
		case HostComponent:
			return updateHostComponent(wip)
		case HostText:
			return null
		default:
			if (__DEV__) {
				console.warn('beginWork未实现的类型')
			}
	}

	return wip
}

function updateHostRoot(wip: FiberNode) {
	const baseState = wip.memorizeState
	const updateQueue = wip.updateQueue as UpdateQueue<Element>
	const pending = updateQueue.shared.pending
	updateQueue.shared.pending = null
	const { memorizedState } = processUpdateQueue(baseState, pending)
	wip.memorizeState = memorizedState

	const nextChildren = wip.memorizeState

	reconcileChildren(wip, nextChildren)

	return wip.child
}

function updateHostComponent(wip: FiberNode) {
	const nextProps = wip.pengdingProps
	const nextChildren = nextProps.children
	reconcileChildren(wip, nextChildren)
	return wip.child
}

function reconcileChildren(wip: FiberNode, children?: ReactElement) {
	const current = wip.alternate

	if (current !== null) {
		// update
		wip.child = reconcileChildFibers(wip, current.child, children)
	} else {
		// mount
		wip.child = mountChildFibers(wip, null, children)
	}
}
