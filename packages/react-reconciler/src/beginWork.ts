import { ReactElement } from 'shared/ReactTypes'
import { FiberNode } from './fiber'
import { UpdateQueue, processUpdateQueue } from './updateQueue'
import {
	Fragment,
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './workTags'
import { mountChildFibers, reconcileChildFibers } from './childFiber'
import { renderWithHooks } from './fiberHooks'
import { Lane } from './fiberLanes'

// 递归中的“递”阶段
export const beginWork = (wip: FiberNode, renderLane: Lane) => {
	// 比较，返回子FiberNode
	// 比较子reactElement和current树Fiber，生成新的子Fiber
	switch (wip.tag) {
		case HostRoot:
			return updateHostRoot(wip, renderLane)
		case HostComponent:
			return updateHostComponent(wip)
		case HostText:
			return null
		case FunctionComponent:
			return updateFunctionComponent(wip, renderLane)
		case Fragment:
			return updateFragment(wip)
		default:
			if (__DEV__) {
				console.warn('beginWork未实现的类型', wip)
			}
	}

	return null
}

function updateHostRoot(wip: FiberNode, renderLane: Lane) {
	const baseState = wip.memorizeState
	const updateQueue = wip.updateQueue as UpdateQueue<Element>
	const pending = updateQueue.shared.pending
	updateQueue.shared.pending = null
	const { memorizedState } = processUpdateQueue(baseState, pending, renderLane)
	wip.memorizeState = memorizedState

	const nextChildren = wip.memorizeState

	reconcileChildren(wip, nextChildren)

	return wip.child
}

function updateHostComponent(wip: FiberNode) {
	const nextProps = wip.pendingProps
	const nextChildren = nextProps.children
	reconcileChildren(wip, nextChildren)
	return wip.child
}

function updateFunctionComponent(wip: FiberNode, renderLane: Lane) {
	const nextChildren = renderWithHooks(wip, renderLane)
	reconcileChildren(wip, nextChildren)
	return wip.child
}

function updateFragment(wip: FiberNode) {
	const nextChildren = wip.pendingProps.children
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
