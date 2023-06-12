// ReactDom.createRoot(container).render(<App />)

import {
	UpdateContainer,
	createContainer
} from 'react-reconciler/src/fiberReconciler'
import { Container } from './hostConfig'
import { ReactElement } from 'shared/ReactTypes'

export function createRoot(container: Container) {
	const root = createContainer(container)

	return {
		render(element: ReactElement) {
			return UpdateContainer(element, root)
		}
	}
}
