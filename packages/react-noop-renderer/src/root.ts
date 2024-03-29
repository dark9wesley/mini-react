import {
	updateContainer,
	createContainer
} from 'react-reconciler/src/fiberReconciler'
import { Container, Instance } from './hostConfig'
import { ReactElement } from 'shared/ReactTypes'
import { REACT_ELEMENT, REACT_FRAGMENT } from 'shared/ReactSymbols'
import * as Scheduler from 'scheduler'

let idCounter = 0

export function createRoot() {
	const container: Container = {
		rootID: idCounter++,
		children: []
	}

	// @ts-ignore
	const root = createContainer(container)

	function getChildren(parent: Instance | Container) {
		if (parent) {
			return parent.children
		}

		return null
	}

	function getChildrenAsJSX(root: Container) {
		const children = childToJSX(getChildren(root))

		if (Array.isArray(children)) {
			return {
				$$typeof: REACT_ELEMENT,
				type: REACT_FRAGMENT,
				key: null,
				ref: null,
				props: { children },
				__mark: 'Wesley'
			}
		}

		return children
	}

	function childToJSX(child: any): any {
		if (typeof child === 'string' || typeof child === 'number') {
			return child
		}

		if (Array.isArray(child)) {
			if (child.length === 0) {
				return null
			}

			if (child.length === 1) {
				return childToJSX(child[0])
			}

			const children = child.map(childToJSX)

			if (
				children.every(
					(child) => typeof child === 'string' || typeof child === 'number'
				)
			) {
				return children.join('')
			}

			return children
		}

		// Instance
		if (Array.isArray(child.children)) {
			const instance: Instance = child
			const children = childToJSX(instance.children)
			const props = instance.props

			if (children !== null) {
				props.children = children
			}

			return {
				$$typeof: REACT_ELEMENT,
				type: instance.type,
				key: null,
				ref: null,
				props,
				__mark: 'Wesley'
			}
		}

		// TextInstance
		return child.text
	}

	return {
		_Scheduler: Scheduler,
		render(element: ReactElement) {
			return updateContainer(element, root)
		},
		getChildren() {
			return getChildren(container)
		},
		getChildrenAsJSX() {
			return getChildrenAsJSX(container)
		}
	}
}
