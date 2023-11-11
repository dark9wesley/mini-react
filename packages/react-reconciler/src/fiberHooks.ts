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
import { Lane, NoLane, requestUpdateLanes } from './fiberLanes'
import { Flags, PassiveEffect } from './fiberFlags'
import { HookHasEffect, Passive } from './hookEffectTags'

let currentlyRenderingFiber: FiberNode | null = null
let workInProgressHook: Hook | null = null
let currentHook: Hook | null = null
let renderLane: Lane = NoLane

interface Hook {
	memorizedState: any
	updateQueue: unknown
	next: Hook | null
}

export interface Effect {
	tags: Flags
	create: EffectCallback | void
	destroy: EffectCallback | void
	deps: EffectDeps
	// 为了方便副作用的执行使用，和其他Effect连接成链表
	next: Effect | null
}

export interface FCUpdateQueue<State> extends UpdateQueue<State> {
	lastEffect: Effect | null
}

type EffectCallback = () => void
type EffectDeps = any[] | null

const { currentDispatcher } = internals

export function renderWithHooks(wip: FiberNode, lane: Lane) {
	// 赋值
	currentlyRenderingFiber = wip
	// 重置 hooks链表
	wip.memorizeState = null
	// 重置 effect链表
	wip.updateQueue = null
	renderLane = lane

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
	renderLane = NoLane
	return children
}

const HookDispatcherOnUpdate: Dispatcher = {
	useState: updateState,
	useEffect: updateEffect
}

const HookDispatcherOnMount: Dispatcher = {
	useState: mountState,
	useEffect: mountEffect
}

function mountEffect(create: EffectCallback | void, deps: EffectDeps | void) {
	// 找到当前useState对应的hook数据
	const hook = mountWorkInProgressHook()
	const nextDeps = deps === undefined ? null : deps
	;(currentlyRenderingFiber as FiberNode).flags |= PassiveEffect

	hook.memorizedState = pushEffect(
		Passive | HookHasEffect,
		create,
		undefined,
		nextDeps
	)
}

function updateEffect(create: EffectCallback | void, deps: EffectDeps | void) {
	// 找到当前useState对应的hook数据
	const hook = updateWorkInProgressHook()
	const nextDeps = deps === undefined ? null : deps
	let destroy: EffectCallback | void

	if (currentHook !== null) {
		const prevEffect = currentHook.memorizedState as Effect
		destroy = prevEffect.destroy

		if (nextDeps !== null) {
			// 浅比较
			const prevDeps = prevEffect.deps
			if (areHookInputsEqual(nextDeps, prevDeps)) {
				hook.memorizedState = pushEffect(Passive, create, destroy, nextDeps)
				return
			}
		}

		// 浅比较 不相等
		;(currentlyRenderingFiber as FiberNode).flags |= PassiveEffect
		hook.memorizedState = pushEffect(
			Passive | HookHasEffect,
			create,
			destroy,
			nextDeps
		)
	}
}

function areHookInputsEqual(nextDeps: EffectDeps, prevDeps: EffectDeps) {
	if (prevDeps === null || nextDeps === null) {
		return false
	}

	for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
		if (Object.is(prevDeps[i], nextDeps[i])) {
			continue
		}
		return false
	}

	return true
}

function pushEffect(
	hooksFlags: Flags,
	create: EffectCallback | void,
	destroy: EffectCallback | void,
	deps: EffectDeps
): Effect {
	const effect: Effect = {
		tags: hooksFlags,
		create,
		destroy,
		deps,
		next: null
	}

	const fiber = currentlyRenderingFiber as FiberNode
	const updateQueue = fiber.updateQueue as FCUpdateQueue<any>
	if (updateQueue === null) {
		const updateQueue = createFCUpdateQueue()
		fiber.updateQueue = updateQueue
		effect.next = effect
		updateQueue.lastEffect = effect
	} else {
		// 插入
		const lastEffect = updateQueue.lastEffect
		if (lastEffect === null) {
			effect.next = effect
			updateQueue.lastEffect = effect
		} else {
			const firstEffect = lastEffect.next
			lastEffect.next = effect
			effect.next = firstEffect
			updateQueue.lastEffect = effect
		}
	}

	return effect
}

function createFCUpdateQueue<State>() {
	const updateQueue = createUpdateQueue<State>() as FCUpdateQueue<State>
	updateQueue.lastEffect = null

	return updateQueue
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
	queue.shared.pending = null

	if (pending !== null) {
		const { memorizedState } = processUpdateQueue(
			hook.memorizedState,
			pending,
			renderLane
		)
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
	scheduleUpdateOnFiber(fiber, lane)
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
