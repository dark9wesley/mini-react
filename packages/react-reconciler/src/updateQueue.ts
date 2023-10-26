import { Dispatch } from 'react/src/currentDispatcher'
import { Action } from 'shared/ReactTypes'

export interface Update<State> {
	action: Action<State>
	next: Update<any> | null
}

export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null
	}
	dispatch: Dispatch<State> | null
}

export const createUpdate = <State>(action: Action<State>): Update<State> => {
	return {
		action,
		next: null
	}
}

export const createUpdateQueue = <State>() => {
	return {
		shared: {
			pending: null
		},
		dispatch: null
	} as UpdateQueue<State>
}

export const enqueueUpdate = <State>(
	updateQueue: UpdateQueue<State>,
	update: Update<State>
) => {
	const pending = updateQueue.shared.pending
	if (pending === null) {
		// pending = a ---> a
		// 第一个update与自身形成环状链表
		update.next = update
	} else {
		// pending = b ---> a ---> b
		// 后续进来的update处于链表的前面，同时最后一个update指向第一个，形成环状链表
		update.next = pending.next
		pending.next = update
	}
	updateQueue.shared.pending = update
}

export const processUpdateQueue = <State>(
	baseState: State,
	pendingUpdate: Update<State> | null
): { memorizedState: State } => {
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memorizedState: baseState
	}
	if (pendingUpdate !== null) {
		const action = pendingUpdate.action
		if (action instanceof Function) {
			result.memorizedState = action(baseState)
		} else {
			result.memorizedState = action
		}
	}

	return result
}
