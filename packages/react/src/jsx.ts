import { REACT_ELEMENT } from 'shared/ReactSymbols'
import { Type, Key, Ref, Props, ReactElement } from 'shared/ReactTypes'

// ReactElement
const ReactElement = (type: Type, key: Key, ref: Ref, props: Props) => {
	const element: ReactElement = {
		$$typeof: REACT_ELEMENT,
		key,
		ref,
		props,
		type,
		__mark: 'Wesley'
	}

	return element
}
