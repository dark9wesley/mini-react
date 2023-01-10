import currentDispatcher, {
	Dispatcher,
	resolveDispatcher
} from './src/currentDispatcher'
// TODO 根据使用环境决定jsx还是jsxDEV
export { jsx as createElement } from './src/jsx'
export { isValidElement } from './src/jsx'

export const useState: Dispatcher['useState'] = (initialState) => {
	const dispatch = resolveDispatcher()
	return dispatch.useState(initialState)
}

// 内部数据共享层
export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
	currentDispatcher
}

export const version = '0.0.0'
