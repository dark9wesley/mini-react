import internals from 'shared/internals'
import { FiberNode } from './fiber'
import { Dispatch, Dispatcher } from 'react/src/currentDispatcher'
import { UpdateQueue, createUpdateQueue } from './updateQueue'
import { createUpdate } from './updateQueue'
import { enqueueUpdate } from './updateQueue'
import { scheduleUpdateOnFiber } from './workLoop'
import { Action } from 'shared/ReactTypes'

let currentlyRenderingFiber: FiberNode | null = null
let workInProgressHook: Hook | null = null

interface Hook {
	memorizedState: any
	updateQueue: unknown
	next: Hook | null
}

const { currentDispatcher } = internals

export function renderWithHooks(wip: FiberNode) {
	// 赋值
	currentlyRenderingFiber = wip
	wip.memorizeState = null

	const current = wip.alternate

	if (current !== null) {
		//update
		currentDispatcher.current = HookDispatcherOnUpdate
	} else {
		//mount时的hook实现
		currentDispatcher.current = HookDispatcherOnMount
	}

	const Component = wip.type
	const props = wip.pendingProps
	const children = Component(props)
	// 重置
	currentlyRenderingFiber = null
	return children
}

const HookDispatcherOnUpdate: Dispatcher = {
	useState: mountState
}

const HookDispatcherOnMount: Dispatcher = {
	useState: mountState
}

function mountState<State>(
	initialState: (() => State) | State
): [State, Dispatch<State>] {
	// 找到当前useState对应的hook数据
	const hook = mountWorkInProgressHook()

	let memorizedState
	if (initialState instanceof Function) {
		memorizedState = initialState()
	} else {
		memorizedState = initialState
	}

	const queue = createUpdateQueue<State>()
	hook.updateQueue = queue
	hook.memorizedState = memorizedState

	// @ts-ignore
	const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue)
	queue.dispatch = dispatch

	return [memorizedState, dispatch]
}

function dispatchSetState<State>(
	fiber: FiberNode,
	updateQueue: UpdateQueue<State>,
	action: Action<State>
) {
	const update = createUpdate(action)
	enqueueUpdate(updateQueue, update)
	scheduleUpdateOnFiber(fiber)
}

function mountWorkInProgressHook(): Hook {
	const hook: Hook = {
		memorizedState: null,
		updateQueue: null,
		next: null
	}

	if (workInProgressHook === null) {
		// mount时，且当前为第一个hook
		if (currentlyRenderingFiber === null) {
			throw new Error('请在函数组件内调用hook')
		} else {
			workInProgressHook = hook
			currentlyRenderingFiber.memorizeState = workInProgressHook
		}
	} else {
		// mount时，后续的hook
		workInProgressHook.next = hook
		workInProgressHook = hook
	}

	return workInProgressHook
}
