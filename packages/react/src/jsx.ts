import { REACT_ELEMENT, REACT_FRAGMENT } from 'shared/ReactSymbols'
import {
	Type,
	Key,
	Ref,
	Props,
	ReactElement,
	ElementType
} from 'shared/ReactTypes'

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

export const jsx = (
	type: ElementType,
	config: any,
	...maybeChildren: any[]
) => {
	let key: Key = null
	let ref: Ref = null
	const props: Props = {}

	for (const prop in config) {
		const val = config[prop]
		if (prop === 'key') {
			if (val !== undefined) {
				key = val + ''
			}
			continue
		}
		if (prop === 'ref') {
			if (val !== undefined) {
				ref = val
			}
			continue
		}
		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = val
		}
	}

	const maybeChildrenLength = maybeChildren.length
	if (maybeChildrenLength) {
		if (maybeChildrenLength === 1) {
			props.children = maybeChildren[0]
		} else {
			props.children = maybeChildren
		}
	}

	return ReactElement(type, key, ref, props)
}

export const Fragment = REACT_FRAGMENT

export const jsxDEV = (type: ElementType, config: any) => {
	let key: Key = null
	let ref: Ref = null
	const props: Props = {}

	for (const prop in config) {
		const val = config[prop]
		if (prop === 'key') {
			if (val !== undefined) {
				key = val + ''
			}
			continue
		}
		if (prop === 'ref') {
			if (val !== undefined) {
				ref = val
			}
			continue
		}
		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = val
		}
	}

	return ReactElement(type, key, ref, props)
}

export function isValidElement(object: any) {
	return (
		typeof object === 'object' &&
		object !== null &&
		object.$$typeof === REACT_ELEMENT
	)
}
