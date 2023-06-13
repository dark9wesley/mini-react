import { Action } from 'shared/ReactTypes'

export interface Dispatcher {
	useState: <T>(initialState: T | (() => T)) => [T, Dispatch<T>]
}

export type Dispatch<State> = (action: Action<State>) => void

const currentDispatcher: { current: Dispatcher | null } = {
	current: null
}

export const resolveDispatcher = (): Dispatcher => {
	const dispatch = currentDispatcher.current

	if (dispatch === null) {
		throw new Error('hook只能在函数组件中执行')
	}

	return dispatch
}

export default currentDispatcher
