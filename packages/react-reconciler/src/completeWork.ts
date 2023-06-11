import {
	appendInitialChild,
	createInstance,
	createTextInstance
} from 'hostConfig'
import { FiberNode } from './fiber'
import { HostComponent, HostRoot, HostText } from './workTags'

// 递归中的“归”阶段
export const completeWork = (wip: FiberNode) => {
	// completeWork
	const newProps = wip.pendingProps
	const current = wip.alternate

	switch (wip.tag) {
		case HostRoot:
			return null
		case HostComponent:
			if (current !== null && wip.stateNode) {
				// update
			} else {
				// 1. 构建DOM
				const instance = createInstance(wip.type, newProps)
				// 2. 将DOM插入DOM树中
				appendAllChildren(instance, wip)
				wip.stateNode = instance
			}
			return null
		case HostText:
			if (current !== null && wip.stateNode) {
				// update
			} else {
				const instance = createTextInstance(newProps.content)
				wip.stateNode = instance
			}
			return null
		default:
			if (__DEV__) {
				console.warn('completeWork未实现的类型', wip)
			}
			return null
	}
}

function appendAllChildren(parent: FiberNode, wip: FiberNode) {
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
		node = node.return
	}
}
