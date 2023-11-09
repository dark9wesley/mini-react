import { Props, Key, ElementType, ReactElement } from 'shared/ReactTypes'
import { Fragment, FunctionComponent, HostComponent, WorkTag } from './workTags'
import { Ref } from 'shared/ReactTypes'
import { Flags, NoFlags } from './fiberFlags'
import { Container } from 'hostConfig'
import { Lane, Lanes, NoLane, NoLanes } from './fiberLanes'
import { Effect } from './fiberHooks'

export class FiberNode {
	tag: WorkTag
	key: Key
	stateNode: any
	type: ElementType
	return: FiberNode | null
	sibling: FiberNode | null
	child: FiberNode | null
	index: number
	ref: Ref

	pendingProps: Props
	memorizeProps: Props | null
	memorizeState: any
	alternate: FiberNode | null
	flags: Flags
	subtreeFlags: Flags
	updateQueue: unknown
	deletions: FiberNode[] | null

	constructor(tag: WorkTag, penddingProps: Props, key: Key) {
		this.tag = tag
		this.key = key || null
		this.stateNode = null
		// 注意区分FiberNode里tag和type的区别
		// tag：表明这个FiberNode是什么类型的Fiber
		// type：类型ReactElement的type，例如tag=FunctionComponent的话 type: () => {}
		this.type = null

		// 指向父Fiber
		this.return = null
		// 指向右边兄弟Fiber
		this.sibling = null
		this.child = null
		//如果有多个同级Fiber，就会用这个
		this.index = 0

		this.ref = null

		// 工作单元相关的属性
		this.pendingProps = penddingProps
		this.memorizeProps = null
		this.memorizeState = null
		this.alternate = null
		// 副作用
		this.flags = NoFlags
		this.subtreeFlags = NoFlags
		this.updateQueue = null
		this.deletions = null
	}
}

export interface PendingPassiveEffects {
	unmount: Effect[]
	update: Effect[]
}

export class FiberRootNode {
	container: Container
	current: FiberNode
	finishedWork: FiberNode | null
	pendingLanes: Lanes
	finishedLane: Lane
	pendingPassiveEffects: PendingPassiveEffects

	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container
		this.current = hostRootFiber
		hostRootFiber.stateNode = this
		this.finishedWork = null
		this.pendingLanes = NoLanes
		this.finishedLane = NoLane

		this.pendingPassiveEffects = {
			unmount: [],
			update: []
		}
	}
}

export const createWorkInProgress = (
	current: FiberNode,
	penddingProps: Props
): FiberNode => {
	let wip = current.alternate

	if (wip === null) {
		// mount
		wip = new FiberNode(current.tag, penddingProps, current.key)
		wip.alternate = current
		current.alternate = wip
		wip.stateNode = current.stateNode
	} else {
		wip.pendingProps = penddingProps
		wip.flags = NoFlags
		wip.subtreeFlags = NoFlags
		wip.deletions = null
	}

	wip.type = current.type
	wip.updateQueue = current.updateQueue
	wip.child = current.child
	wip.memorizeProps = current.memorizeProps
	wip.memorizeState = current.memorizeState

	return wip
}

export function createFiberFromReactElement(element: ReactElement): FiberNode {
	const { type, key, props } = element
	let fiberTag: WorkTag = FunctionComponent

	if (typeof type === 'string') {
		fiberTag = HostComponent
	} else if (typeof type !== 'function' && __DEV__) {
		console.warn('未定义的type类型', element)
	}

	const fiber = new FiberNode(fiberTag, props, key)
	fiber.type = type
	return fiber
}

export function createFiberFromFragment(elements: any[], key: Key): FiberNode {
	const fiber = new FiberNode(Fragment, { children: elements }, key)
	return fiber
}
