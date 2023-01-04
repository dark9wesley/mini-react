import { FiberNode } from './fiber'
import { HostRoot, HostComponent, HostText } from './workTags'
import { UpdateQueue, processUpdateQueue } from './updateQueue'
import { ReactElement } from 'shared/ReactTypes'
import { reconcileChildFibers, mountChildFibers } from './childFibers'
// 递归中的递阶段
export const beginWork = (wip: FiberNode) => {
	// 根据当前fiber的旧state，以及fiber.updateQueue.shared.pending，生成最新的state，放在memorizedState上
	// 并比较子reactElement 和 子currentFiberNode 生成新的子wipFiberNode
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
			return null
	}
}

function updateHostRoot(wip: FiberNode) {
	const baseState = wip.memorizedState
	const updateQueue = wip.updateQueue as UpdateQueue<Element>
	const pendingUpdate = updateQueue.shared.pending
	updateQueue.shared.pending = null
	const { memorizedState } = processUpdateQueue<Element>(
		baseState,
		pendingUpdate
	)
	wip.memorizedState = memorizedState

	const nextChildren = wip.memorizedState
	reconcileChildren(wip, nextChildren)
	return wip.child
}

function updateHostComponent(wip: FiberNode) {
	const nextProps = wip.pendingProps
	const nextChildren = nextProps.children
	reconcileChildren(wip, nextChildren)
	return wip.child
}

/**
 * 生成子fiber，并构建子fiber与父fiber的关系
 */
function reconcileChildren(wip: FiberNode, children?: ReactElement) {
	const current = wip.alternate

	if (current !== null) {
		// update
		wip.child = reconcileChildFibers(wip, current?.child, children)
	} else {
		// mount
		wip.child = mountChildFibers(wip, null, children)
	}
}
