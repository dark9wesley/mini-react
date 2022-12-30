import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols'
import {
	Key,
	Props,
	Ref,
	Type,
	ReactElement,
	ElementType
} from 'shared/ReactTypes'

// ReactElement
const ReactElement = function (
	type: Type,
	key: Key,
	ref: Ref,
	props: Props
): ReactElement {
	const element = {
		$$typeof: REACT_ELEMENT_TYPE,
		type,
		key,
		ref,
		props,
		__mark: 'pengyw97'
	}

	return element
}

export const jsx = (type: ElementType, config: any, ...maybeChildren: any) => {
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

		const maybeChildrenLength = maybeChildren.length
		if (maybeChildrenLength) {
			if (maybeChildrenLength === 1) {
				props.children = maybeChildren[0]
			} else {
				props.children = maybeChildren
			}
		}
	}

	return ReactElement(type, key, ref, props)
}

// 实际React源码中，jsxDev的实现与jsx是不一样的，jsxDev会多做一些检查
export const jsxDev = jsx