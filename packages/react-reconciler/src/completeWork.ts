import {
	Container,
	appendInitialChild,
	createInstance,
	createTextInstance
} from 'hostConfig'
import { FiberNode } from './fiber'
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './workTags'
import { NoFlags, Update } from './fiberFlags'
import { updateFiberProps } from 'react-dom/src/SyntheticEvent'

function markUpdate(fiber: FiberNode) {
	fiber.flags |= Update
}

// 递归中的“归”阶段
export const completeWork = (wip: FiberNode) => {
	// completeWork
	const newProps = wip.pendingProps
	const current = wip.alternate

	switch (wip.tag) {
		case HostRoot:
		case FunctionComponent:
			bubbleProperties(wip)
			return null
		case HostComponent:
			if (current !== null && wip.stateNode) {
				// update
				// TODO 这里需要判断新旧props是否有变化
				// 然后打上Update的tag
				// 最后到commitUpdate中处理更新DOM
				// 现在暂时直接调用updateFiberProps
				updateFiberProps(wip.stateNode, newProps)
			} else {
				// 1. 构建DOM
				const instance = createInstance(wip.type, newProps)
				// 2. 将DOM插入DOM树中
				appendAllChildren(instance, wip)
				wip.stateNode = instance
			}
			bubbleProperties(wip)
			return null
		case HostText:
			if (current !== null && wip.stateNode) {
				// update
				const oldText = current.memorizeProps.content
				const newText = newProps.content
				if (oldText !== newText) {
					markUpdate(wip)
				}
			} else {
				const instance = createTextInstance(newProps.content)
				wip.stateNode = instance
			}
			bubbleProperties(wip)
			return null
		default:
			if (__DEV__) {
				console.warn('completeWork未实现的类型', wip)
			}
			return null
	}
}

function appendAllChildren(parent: Container, wip: FiberNode) {
	let node = wip.child

	while (node !== null) {
		if (node.tag === HostComponent || node.tag === HostText) {
			appendInitialChild(parent, node.stateNode)
		} else if (node.child !== null) {
			node.child.return = node
			node = node.child
			continue
		}

		if (node === wip) {
			return
		}

		while (node.sibling === null) {
			if (node.return === null || node.return === wip) {
				return
			}
			node = node.return
		}
		node.sibling.return = node.return
		node = node.sibling
	}
}

function bubbleProperties(wip: FiberNode) {
	let subtreeFlags = NoFlags
	let child = wip.child

	while (child !== null) {
		subtreeFlags |= child.subtreeFlags
		subtreeFlags |= child.flags

		child.return = wip
		child = child.sibling
	}

	wip.subtreeFlags |= subtreeFlags
}
