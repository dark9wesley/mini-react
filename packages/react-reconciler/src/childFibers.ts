import { createFiberFromElement, FiberNode, createWorkInProgess } from './fiber'
import { Props, ReactElement } from 'shared/ReactTypes'
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols'
import { HostText } from './workTags'
import { ChildDeletion, Placement } from './fiberFlags'

function ChildReconciler(shouldTrackEffects: boolean) {
	function deleteChild(returnFiber: FiberNode, childToDelete: FiberNode) {
		if (!shouldTrackEffects) {
			return
		}
		const deletions = returnFiber.deletions
		if (deletions === null) {
			returnFiber.deletions = [childToDelete]
			returnFiber.flags |= ChildDeletion
		} else {
			deletions.push(childToDelete)
		}
	}

	function deleteRemainingChildren(
		returnFiber: FiberNode,
		currentFirstChild: FiberNode | null
	) {
		if (!shouldTrackEffects) {
			return
		}
		let childToDelete = currentFirstChild
		while (childToDelete !== null) {
			deleteChild(returnFiber, childToDelete)
			childToDelete = childToDelete.sibling
		}
	}

	function useFiber(fiber: FiberNode, pengdingProps: Props) {
		const clone = createWorkInProgess(fiber, pengdingProps)
		clone.index = 0
		clone.sibling = null
		return clone
	}

	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		element: ReactElement
	) {
		const key = element.key
		while (currentFiber !== null) {
			// update
			if (currentFiber.key === key) {
				// key相同
				if (element.$$typeof === REACT_ELEMENT_TYPE) {
					if (currentFiber.type === element.type) {
						const existing = useFiber(currentFiber, element.props)
						existing.return = returnFiber
						// 当前节点可复用, 将剩余的兄弟节点标记删除
						deleteRemainingChildren(returnFiber, currentFiber.sibling)
						return existing
					}
					// key相同，type不同，删掉所有旧的
					deleteRemainingChildren(returnFiber, currentFiber)
					break
				} else {
					if (__DEV__) {
						console.warn('还未实现的类型', element)
						break
					}
				}
			} else {
				// key不同, 删掉旧的
				deleteChild(returnFiber, currentFiber)
				currentFiber = currentFiber.sibling
			}
		}

		const fiber = createFiberFromElement(element)
		fiber.return = returnFiber
		return fiber
	}

	function reconcileSingleTextNode(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		content: string | number
	) {
		while (currentFiber !== null) {
			// update
			if (currentFiber.tag === HostText) {
				const existing = useFiber(currentFiber, { content })
				existing.return = returnFiber
				deleteRemainingChildren(returnFiber, currentFiber.sibling)
				return existing
			}
			deleteChild(returnFiber, currentFiber)
			currentFiber = currentFiber.sibling
		}

		const fiber = new FiberNode(HostText, { content }, null)
		fiber.return = returnFiber
		return fiber
	}

	function placeSingleChild(fiber: FiberNode) {
		if (shouldTrackEffects && fiber.alternate === null) {
			fiber.flags |= Placement
		}
		return fiber
	}

	return function reconcileChildFibers(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		newChild?: ReactElement
	) {
		// 判断当前fiber的类型
		if (typeof newChild === 'object' && newChild !== null) {
			switch (newChild.$$typeof) {
				case REACT_ELEMENT_TYPE:
					return placeSingleChild(
						reconcileSingleElement(returnFiber, currentFiber, newChild)
					)
				default:
					if (__DEV__) {
						console.warn('未实现的reconcile类型', newChild)
					}
					break
			}
		}

		// TODO 多节点情况 ul -> li*3
		if (typeof newChild === 'string' || typeof newChild === 'number') {
			return placeSingleChild(
				reconcileSingleTextNode(returnFiber, currentFiber, newChild)
			)
		}

		if (currentFiber !== null) {
			// 兜底情况
			deleteChild(returnFiber, currentFiber)
		}

		if (__DEV__) {
			console.warn('未实现的reconcile类型', newChild)
		}
		return null
	}
}

export const reconcileChildFibers = ChildReconciler(true)
export const mountChildFibers = ChildReconciler(false)
