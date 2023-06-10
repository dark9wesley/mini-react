import { ReactElement } from 'shared/ReactTypes'
import { FiberNode } from './fiber'
import { REACT_ELEMENT } from 'shared/ReactSymbols'

function ChildReconciler(shouldTrackEffect: boolean) {
	return function reconcileChildFibers(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		newChild?: ReactElement
	) {
		if (typeof newChild === 'object' && newChild !== null) {
			switch (newChild.$$typeof) {
				case REACT_ELEMENT:
					// return reconcileSingleElement()
					return '1' as unknown as FiberNode
				default:
					if (__DEV__) {
						console.warn('未实现的reconcile类型', newChild)
					}
					break
			}
		}

		return null
		// TODO 多节点情况
	}
}

export const reconcileChildFibers = ChildReconciler(true)
export const mountChildFibers = ChildReconciler(false)
