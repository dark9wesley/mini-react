import { Dispatcher, resolveDispatcher } from './src/currentDispatcher'
import { jsx } from './src/jsx'
import currentDispatcher from './src/currentDispatcher'

export const useState: Dispatcher['useState'] = (initialState: any) => {
	const dispatch = resolveDispatcher()
	return dispatch.useState(initialState)
}

// 内部数据共享层
export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
	currentDispatcher
}

export const version = '0.0.0'

// TODO 根据使用环境导出jsx/jsxDEV
export const createElement = jsx

export { isValidElement } from './src/jsx'
