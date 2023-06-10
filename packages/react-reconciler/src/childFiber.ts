import { ReactElement } from 'shared/ReactTypes'
import { FiberNode, createFiberFromReactElement } from './fiber'
import { REACT_ELEMENT } from 'shared/ReactSymbols'
import { HostText } from './workTags'

function ChildReconciler(shouldTrackEffect: boolean) {
	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		element: ReactElement
	) {
		// 根据element创建fiber
		const fiber = createFiberFromReactElement(element)
		fiber.return = returnFiber

		return fiber
	}

	function reconcileSingleTextNode(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		content: string | number
	) {
		const fiber = new FiberNode(HostText, { content }, null)
		fiber.return = returnFiber

		return fiber
	}

	return function reconcileChildFibers(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		newChild?: ReactElement
	) {
		if (typeof newChild === 'object' && newChild !== null) {
			switch (newChild.$$typeof) {
				case REACT_ELEMENT:
					return reconcileSingleElement(returnFiber, currentFiber, newChild)
				default:
					if (__DEV__) {
						console.warn('未实现的reconcile类型', newChild)
					}
					break
			}
		}

		// TODO 多节点情况

		// HostText
		if (typeof newChild === 'string' || typeof newChild === 'number') {
			return reconcileSingleTextNode(returnFiber, currentFiber, newChild)
		}

		if (__DEV__) {
			console.warn('未实现的reconcile类型', newChild)
		}

		return null
	}
}

export const reconcileChildFibers = ChildReconciler(true)
export const mountChildFibers = ChildReconciler(false)
