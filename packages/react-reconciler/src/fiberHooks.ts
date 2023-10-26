import internals from 'shared/internals'
import { FiberNode } from './fiber'
import { Dispatch, Dispatcher } from 'react/src/currentDispatcher'
import {
	UpdateQueue,
	createUpdateQueue,
	processUpdateQueue
} from './updateQueue'
import { createUpdate } from './updateQueue'
import { enqueueUpdate } from './updateQueue'
import { scheduleUpdateOnFiber } from './workLoop'
import { Action } from 'shared/ReactTypes'
import { requestUpdateLanes } from './fiberLanes'

let currentlyRenderingFiber: FiberNode | null = null
let workInProgressHook: Hook | null = null
let currentHook: Hook | null = null

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
	useState: updateState
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
function updateState<State>(
	initialState: (() => State) | State
): [State, Dispatch<State>] {
	// 找到当前useState对应的hook数据
	const hook = updateWorkInProgressHook()

	// 计算新State的逻辑
	const queue = hook.updateQueue as UpdateQueue<State>
	const pending = queue.shared.pending

	if (pending !== null) {
		const { memorizedState } = processUpdateQueue(hook.memorizedState, pending)
		hook.memorizedState = memorizedState
	}

	return [hook.memorizedState, queue.dispatch as Dispatch<State>]
}

function dispatchSetState<State>(
	fiber: FiberNode,
	updateQueue: UpdateQueue<State>,
	action: Action<State>
) {
	const lane = requestUpdateLanes()
	const update = createUpdate(action, lane)
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

function updateWorkInProgressHook(): Hook {
	// TODO render阶段触发的更新
	let nextCurrentHook: Hook | null = null

	if (currentHook === null) {
		// 这个FC组件Update时的第一个hook
		const current = currentlyRenderingFiber?.alternate
		if (current !== null) {
			nextCurrentHook = current?.memorizeState
		} else {
			nextCurrentHook = null
		}
	} else {
		// 这个FC组件Update时的后续hook
		nextCurrentHook = currentHook.next
	}

	if (nextCurrentHook === null) {
		throw new Error(
			`组件${currentlyRenderingFiber?.type}本次执行hook与上一次不一致`
		)
	}

	currentHook = nextCurrentHook as Hook

	const newHook: Hook = {
		memorizedState: currentHook.memorizedState,
		updateQueue: currentHook.updateQueue,
		next: null
	}

	if (workInProgressHook === null) {
		if (currentlyRenderingFiber === null) {
			throw new Error('请在函数组件内调用hook')
		} else {
			workInProgressHook = newHook
			currentlyRenderingFiber.memorizeState = workInProgressHook
		}
	} else {
		// mount时，后续的hook
		workInProgressHook.next = newHook
		workInProgressHook = newHook
	}

	return workInProgressHook
}
