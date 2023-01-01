import { Props, Key, Ref } from 'shared/ReactTypes'
import { WorkTag } from './workTags'

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
	}
}
