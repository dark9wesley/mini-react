import {
	appendChildToContainer,
	commitUpdate,
	Container,
	removeChild
} from 'hostConfig'
import { FiberNode, FiberRootNode } from './fiber'
import {
	MutationMask,
	NoFlags,
	Placement,
	Update,
	ChildDeletion
} from './fiberFlags'
import {
	HostComponent,
	HostRoot,
	HostText,
	FunctionComponent
} from './workTags'

let nextEffect: FiberNode | null = null

export const commitMutationEffects = (finishedWork: FiberNode) => {
	nextEffect = finishedWork

	while (nextEffect !== null) {
		// 向下遍历
		const child: FiberNode | null = nextEffect.child

		if (
			(nextEffect.subtreeFlags & MutationMask) !== NoFlags &&
			child !== null
		) {
			nextEffect = child
		} else {
			// 向上遍历
			up: while (nextEffect !== null) {
				// 看一下本身有没有flags 有就执行
				commitMutationEffectsOnFiber(nextEffect)
				const sibling: FiberNode | null = nextEffect.sibling

				if (sibling !== null) {
					nextEffect = sibling
					break up
				}

				nextEffect = nextEffect.return
			}
		}
	}
}

const commitMutationEffectsOnFiber = (finishedWork: FiberNode) => {
	const flags = finishedWork.flags

	if ((flags & Placement) !== NoFlags) {
		commitPlacement(finishedWork)
		finishedWork.flags &= ~Placement
	}

	if ((flags & Update) !== NoFlags) {
		commitUpdate(finishedWork)
		finishedWork.flags &= ~Update
	}

	if ((flags & ChildDeletion) !== NoFlags) {
		const deletions = finishedWork.deletions
		if (deletions !== null) {
			deletions.forEach((childToDelete) => commitDeletion(childToDelete))
		}
		finishedWork.flags &= ~ChildDeletion
	}
}

const commitDeletion = (childToDelete: FiberNode) => {
	let rootHostNode: FiberNode | null = null

	// 递归子树
	commitNestedComponent(childToDelete, (unmountFiber) => {
		switch (unmountFiber.tag) {
			case HostComponent:
				if (rootHostNode === null) {
					rootHostNode = unmountFiber
				}
				//TODO 解绑ref
				return
			case HostText:
				if (rootHostNode === null) {
					rootHostNode = unmountFiber
				}
				return
			case FunctionComponent:
				// TODO useEffect unmount
				return
			default:
				if (__DEV__) {
					console.warn('未处理的unmount类型', unmountFiber)
				}
		}
	})

	// 移除rootHostNode的DOM
	if (rootHostNode !== null) {
		const hostParent = getHostParent(childToDelete)
		if (hostParent !== null) {
			removeChild(rootHostNode, hostParent)
		}
		childToDelete.return = null
		childToDelete.child = null
	}
}

const commitNestedComponent = (
	root: FiberNode,
	onCommitUnmount: (fiber: FiberNode) => void
) => {
	let node = root
	while (true) {
		onCommitUnmount(node)
		// 向下遍历
		if (node.child) {
			node = node.child
			continue
		}

		if (node === root) {
			// 终止
			return
		}

		while (node.sibling === null) {
			if (node.return === null || node.return === root) {
				return
			}

			// 向上归
			node = node.return
		}
		node.sibling.return = node.return
		node = node.sibling
	}
}

const commitPlacement = (finishedWork: FiberNode) => {
	if (__DEV__) {
		console.warn('执行Placement操作', finishedWork)
	}

	// 得到父级DOM节点
	const hostParent = getHostParent(finishedWork)
	// 将当前节点插入父级节点中
	if (hostParent !== null) {
		appendPlacementNodeIntoContainer(finishedWork, hostParent)
	}
}

function getHostParent(fiber: FiberNode): Container | null {
	let parent = fiber.return

	while (parent) {
		const parentTag = parent.tag
		// HostComponent HostRoot
		if (parentTag === HostComponent) {
			return parent.stateNode as Container
		}
		if (parentTag === HostRoot) {
			return (parent.stateNode as FiberRootNode).container
		}
		parent = parent.return
	}

	if (__DEV__) {
		console.warn('未找到host parent')
	}
	return null
}

function appendPlacementNodeIntoContainer(
	finishedWork: FiberNode,
	hostParent: Container
) {
	if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
		appendChildToContainer(hostParent, finishedWork.stateNode)
		return
	}
	const child = finishedWork.child
	if (child !== null) {
		appendPlacementNodeIntoContainer(child, hostParent)
		let sibling = child.sibling

		while (sibling !== null) {
			appendPlacementNodeIntoContainer(sibling, hostParent)
			sibling = sibling.sibling
		}
	}
}
