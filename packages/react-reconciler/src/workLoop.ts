import { beginWork } from './beginWork'
import { completeWork } from './completeWork'
import { FiberNode } from './fiber'

let workInProgress: FiberNode | null = null

/**
 * 初始化
 * 让指针workInProgress指向第一个FiberNode
 */
function prepareFreshStack(fiber: FiberNode) {
	workInProgress = fiber
}

function renderRoot(root: FiberNode) {
	// 初始化方法
	prepareFreshStack(root)

	do {
		try {
			workLoop()
			break
		} catch (e) {
			console.warn('workLoop error', e)
			workInProgress = null
		}
	} while (true)
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
	const node: FiberNode | null = fiber

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
