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

interface Hook {
	memorizedState: any
	updateQueue: unknown
	next: Hook | null
}

let currentlyRenderingFiber: FiberNode | null = null
let workInProgressHook: Hook | null = null
const { currentDispatcher } = internals

export function renderWithHooks(wip: FiberNode) {
	// 赋值操作
	currentlyRenderingFiber = wip
	// 重置
	wip.memorizedState = null

	const current = wip.alternate

	if (current !== null) {
		// update
	} else {
		// mount
		currentDispatcher.current = HooksDispatcherOnMount
	}

	const Component = wip.type
	const props = wip.pendingProps
	const children = Component(props)

	// 重置操作
	currentlyRenderingFiber = null

	return children
}

const HooksDispatcherOnMount: Dispatcher = {
	useState: mountState,
	useEffect: null
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
