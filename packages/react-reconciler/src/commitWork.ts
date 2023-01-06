import { appendChildToContainer, Container } from 'hostConfig'
import { FiberNode, FiberRootNode } from './fiber'
import { MutationMask, NoFlags, Placement } from './fiberFlags'
import { HostComponent, HostRoot, HostText } from './workTags'

let nextEffect: FiberNode | null = null

export const commitMutationEffects = (finishedWork: FiberNode) => {
	nextEffect = finishedWork

	while (nextEffect !== null) {
		// 向下遍历
		const child = nextEffect.child

		if (
			(nextEffect.subtreeFlags & MutationMask) !== NoFlags &&
			child !== null
		) {
			nextEffect === child
		} else {
			// 向上遍历
			up: while (nextEffect !== null) {
				// 看一下本身有没有flags 有就执行
				commitMutationEffectsOnFiber(nextEffect)

				if (nextEffect.sibling !== null) {
					nextEffect = nextEffect.sibling
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

	// flags Update
	// flags ChildDeletion
}

const commitPlacement = (finishedWork: FiberNode) => {
	if (__DEV__) {
		console.warn('执行placement', finishedWork)
	}

	// 得到父级DOM节点
	const hostParent = getHostParent(finishedWork)
	// 将当前节点插入父级节点中
	appendPlacementNodeIntoContainer(finishedWork, hostParent)
}

const getHostParent = (fiber: FiberNode): Container => {
	let parent = fiber.return

	while (parent) {
		if (parent.tag === HostComponent) {
			return parent.stateNode as Container
		}
		if (parent.tag === HostRoot) {
			return (parent.stateNode as FiberRootNode).container
		}
		parent = parent.return
	}

	if (__DEV__) {
		console.warn('未找到host parent')
	}
}

function appendPlacementNodeIntoContainer(
	finishedWork: FiberNode,
	hostParent: Container
) {
	if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
		appendChildToContainer(finishedWork.stateNode, hostParent)
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
