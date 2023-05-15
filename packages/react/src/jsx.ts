import { REACT_ELEMENT } from 'shared/ReactSymbols'

// ReactElement
const ReactElement = (type, key, ref, props) => {
	const element = {
		$$typeof: REACT_ELEMENT,
		key,
		ref,
		props,
		type,
		__mark: 'Wesley'
	}

	return element
}
