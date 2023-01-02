import { Props, Key, Ref } from 'shared/ReactTypes'
import { WorkTag } from './workTags'
import { Flags, NoFlags } from './fiberFlags'
import { Container } from 'hostConfig'

export class FiberNode {
	type: any
	tag: WorkTag
	pendingProps: Props
	key: Key
	stateNode: any
	ref: Ref | null

	return: FiberNode | null
	sibling: FiberNode | null
	child: FiberNode | null
	index: number

	memorizedProps: Props | null
	memorizedState: any
	alternate: FiberNode | null
	flags: Flags
	updateQueue: unknown

	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		this.tag = tag
		this.key = key
		// HostComponent: <div></div> DOM
		this.stateNode = null
		// FunctionComponent: () => {}
		this.type = null

		// 构成树状结构
		// 指向父fiberNode
		this.return = null
		// 指向右边兄弟fiberNode
		this.sibling = null
		// 指向子fiberNode
		this.child = null
		// 存在多个同级fiberNode时 从0递增
		this.index = 0

		this.ref = null

		// 作为工作单元
		this.pendingProps = pendingProps
		this.memorizedProps = null
		this.memorizedState = null
		this.alternate = null
		this.updateQueue = null

		// 副作用
		this.flags = NoFlags
	}
}

export class FiberRootNode {
	container: Container
	current: FiberNode
	finishedWork: FiberNode | null

	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container
		this.current = hostRootFiber
		hostRootFiber.stateNode = this
		this.finishedWork = null
	}
}

export const createWorkInProgess = (
	current: FiberNode,
	pendingProps: Props
): FiberNode => {
	let wip = current.alternate

	if (wip === null) {
		// mount
		wip = new FiberNode(current.tag, pendingProps, current.key)
		wip.stateNode = current.stateNode
		wip.alternate = current
		current.alternate = wip
	} else {
		// update
		wip.pendingProps = pendingProps
		wip.flags = NoFlags
	}
	wip.type = current.type
	wip.updateQueue = current.updateQueue
	wip.child = current.child
	wip.memorizedProps = current.memorizedProps
	wip.memorizedState = current.memorizedState

	return wip
}
