import { Dispatcher, Dispatch } from 'react/src/currentDispatcher'
import internals from 'shared/internals'
import { Action } from 'shared/ReactTypes'
import { FiberNode } from './fiber'
import {
	createUpdate,
	createUpdateQueue,
	UpdateQueue,
	enqueueUpdate
} from './updateQueue'
import { scheduleUpdateOnFiber } from './workLoop'
import { processUpdateQueue } from './updateQueue'

interface Hook {
	memorizedState: any
	updateQueue: unknown
	next: Hook | null
}

let currentlyRenderingFiber: FiberNode | null = null
let workInProgressHook: Hook | null = null
let currentHook: Hook | null = null

const { currentDispatcher } = internals

export function renderWithHooks(wip: FiberNode) {
	// 赋值操作
	currentlyRenderingFiber = wip
	// 重置
	wip.memorizedState = null

	const current = wip.alternate

	if (current !== null) {
		// update
		currentDispatcher.current = HooksDispatcherOnUpdate
	} else {
		// mount
		currentDispatcher.current = HooksDispatcherOnMount
	}

	const Component = wip.type
	const props = wip.pendingProps
	const children = Component(props)

	// 重置操作
	currentlyRenderingFiber = null
	workInProgressHook = null
	currentHook = null

	return children
}

const HooksDispatcherOnMount: Dispatcher = {
	useState: mountState,
	useEffect: null
}

const HooksDispatcherOnUpdate: Dispatcher = {
	useState: updateState,
	useEffect: null
}

function updateState<State>(): [State, Dispatch<State>] {
	// 基于之前的hook得到一个新的hook
	const hook = updateWorkInProgressHook()

	// 计算新state的逻辑
	const queue = hook.updateQueue as UpdateQueue<State>
	const pending = queue.shared.pending
	if (pending !== null) {
		const { memorizedState } = processUpdateQueue(hook.memorizedState, pending)
		hook.memorizedState = memorizedState
	}

	return [hook.memorizedState, queue.dispatch as Dispatch<State>]
}

function updateWorkInProgressHook(): Hook {
	// TODO render阶段触发的更新
	let nextCurrentHook: Hook | null = null
	if (currentHook === null) {
		// 这是这个FC update时的第一个Hook
		const current = currentlyRenderingFiber?.alternate
		if (current !== null) {
			nextCurrentHook = current?.memorizedState
		} else {
			nextCurrentHook = null
		}
	} else {
		// 这个FC update时后续的Hook
		nextCurrentHook = currentHook.next
	}

	if (nextCurrentHook === null) {
		throw new Error(
			`组件${currentlyRenderingFiber?.type}本次执行时的hook比上次执行时多`
		)
	}

	currentHook = nextCurrentHook

	const newHook: Hook = {
		memorizedState: currentHook?.memorizedState,
		updateQueue: currentHook?.updateQueue,
		next: null
	}

	if (workInProgressHook === null) {
		// update时且为第一个hook
		if (currentlyRenderingFiber === null) {
			throw new Error('请在函数组件内调用hook')
		} else {
			workInProgressHook = newHook
			currentlyRenderingFiber.memorizedState = workInProgressHook
		}
	} else {
		workInProgressHook.next = newHook
		workInProgressHook = newHook
	}

	return newHook
}

function mountState<State>(
	initialState: () => State | State
): [State, Dispatch<State>] {
	// 创建一个hook
	const hook = mountWorkInProgressHook()
	let memorizedState
	if (initialState instanceof Function) {
		memorizedState = initialState()
	} else {
		memorizedState = initialState
	}

	const queue = createUpdateQueue()
	hook.updateQueue = queue
	hook.memorizedState = memorizedState

	//@ts-ignore
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
		next: null,
		updateQueue: null
	}

	if (workInProgressHook === null) {
		// mount时且为第一个hook
		if (currentlyRenderingFiber === null) {
			throw new Error('请在函数组件内调用hook')
		} else {
			workInProgressHook = hook
			currentlyRenderingFiber.memorizedState = workInProgressHook
		}
	} else {
		workInProgressHook.next = hook
		workInProgressHook = hook
	}

	return workInProgressHook
}
