import {
	UpdateContainer,
	createContainer
} from 'react-reconciler/src/fiberReconciler'
import { Container, Instance } from './hostConfig'
import { ReactElement } from 'shared/ReactTypes'

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

	return {
		render(element: ReactElement) {
			return UpdateContainer(element, root)
		},
		getChildren() {
			return getChildren(container)
		}
	}
}
