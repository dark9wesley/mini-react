import { beginWork } from './beginWork'
import { completeWork } from './completeWork'
import { FiberNode, FiberRootNode, createWorkInProgess } from './fiber'
import { HostRoot } from './workTags'
import { MutationMask, NoFlags } from './fiberFlags'
import { commitMutationEffects } from './commitWork'

let workInProgress: FiberNode | null = null

/**
 * 初始化
 * 让指针workInProgress指向第一个FiberNode
 */
function prepareFreshStack(root: FiberRootNode) {
	workInProgress = createWorkInProgess(root.current, {})
}

export function scheduleUpdateOnFiber(fiber: FiberNode) {
	// 调度功能
	// 对于mounted，传进来的fiber是hostRootFiber
	// 对于update，传进来的是发生更新的fiber
	const root = markUpdateFromFiberToRoot(fiber)
	renderRoot(root)
}

/**
 * 从发生更新的fiber回溯到FiberRootNode
 */
function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber
	let parent = node.return
	while (parent !== null) {
		node = parent
		parent = node.return
	}
	if (node.tag === HostRoot) {
		return node.stateNode
	}
	return null
}

function renderRoot(root: FiberRootNode) {
	// 初始化方法
	prepareFreshStack(root)

	do {
		try {
			workLoop()
			break
		} catch (e) {
			if (__DEV__) {
				console.warn('workLoop error', e)
			}
			workInProgress = null
		}
	} while (true)

	const finishedWork = root.current.alternate
	root.finishedWork = finishedWork

	commitRoot(root)
}

function commitRoot(root: FiberRootNode) {
	const finishedWork = root.finishedWork

	if (finishedWork === null) {
		return
	}

	if (__DEV__) {
		console.log('commit阶段开始', finishedWork)
	}

	// 重置
	root.finishedWork = null

	// 判断是否存在需要三个子阶段执行的操作
	const subtreeHasEffects =
		(finishedWork.subtreeFlags & MutationMask) != NoFlags
	const rootHasEffects = (finishedWork.flags & MutationMask) != NoFlags

	if (subtreeHasEffects || rootHasEffects) {
		// beforeMutation
		// mutation
		commitMutationEffects(finishedWork)
		root.current = finishedWork
		// layout
	} else {
		root.current = finishedWork
	}
}

function workLoop() {
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress)
	}
}

function performUnitOfWork(fiber: FiberNode) {
	const next = beginWork(fiber)
	fiber.memorizedProps = fiber.pendingProps

	if (next === null) {
		completeUnitOfWork(fiber)
	} else {
		workInProgress = next
	}
}

function completeUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber

	do {
		completeWork(node)
		const sibling = node.sibling

		if (sibling !== null) {
			workInProgress = sibling
			return
		}

		node = node.return
		workInProgress = node
	} while (node !== null)
}
