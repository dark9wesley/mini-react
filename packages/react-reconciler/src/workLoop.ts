import { scheduleMicroTask } from 'hostConfig'
import { beginWork } from './beginWork'
import { commitMutationEffects } from './commitWork'
import { completeWork } from './completeWork'
import { FiberNode, FiberRootNode, createWorkInProgress } from './fiber'
import { MutationMask, NoFlags } from './fiberFlags'
import {
	Lane,
	NoLane,
	SyncLane,
	getHighestPriorityLane,
	mergeLanes
} from './fiberLanes'
import { HostRoot } from './workTags'
import { flushSyncCallback, scheduleSyncCallback } from './syncTaskQueue'

let workInProgress: FiberNode | null = null

function prepareFreshStack(root: FiberRootNode) {
	workInProgress = createWorkInProgress(root.current, {})
}

export function scheduleUpdateOnFiber(fiber: FiberNode, lane: Lane) {
	const root = markUpdateFromFiberToRoot(fiber)
	// 将本次更新的lane记录在FiberRootNode中
	markRootUpdate(root, lane)
	ensureRootIsScheduled(root)
}

// 调度阶段入口
export function ensureRootIsScheduled(root: FiberRootNode) {
	const updateLane = getHighestPriorityLane(root.pendingLanes)
	if (updateLane === NoLane) {
		return
	}
	if (updateLane === SyncLane) {
		// 同步优先级，微任务调度
		if (__DEV__) {
			console.log('在微任务中调度, 优先级：', updateLane)
		}
		scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root, updateLane))
		scheduleMicroTask(flushSyncCallback)
	} else {
		// 其他优先级，宏任务调度
	}
}

export function markRootUpdate(root: FiberRootNode, lane: Lane) {
	root.pendingLanes = mergeLanes(root.pendingLanes, lane)
}

function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber
	let parent = node.return
	while (parent !== null) {
		node = parent
		parent = parent.return
	}

	if (node.tag === HostRoot) {
		return node.stateNode
	}

	return null
}

function performSyncWorkOnRoot(root: FiberRootNode, lane: Lane) {
	const nextLanes = getHighestPriorityLane(root.pendingLanes)

	if (nextLanes !== SyncLane) {
		// 其他比SyncLane低的优先级
		// NoLane
		ensureRootIsScheduled(root)
		return
	}

	prepareFreshStack(root)

	do {
		try {
			workLoop()
			break
		} catch (e) {
			if (__DEV__) {
				console.warn('workloop发生错误', e)
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
		console.warn('commit阶段开始', finishedWork)
	}

	// 重置
	root.finishedWork = null

	// 判断是否存在三个字阶段需要执行的操作
	const subtreeHasEffect =
		(finishedWork.subtreeFlags & MutationMask) !== NoFlags
	const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags

	if (subtreeHasEffect || rootHasEffect) {
		// beforeMutation
		// mutation
		commitMutationEffects(finishedWork)
		// 切换fiber树
		root.current = finishedWork
		// layout
	} else {
		// 切换fiber树
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
	fiber.memorizeProps = fiber.pendingProps

	if (next === null) {
		completeUnitOfFiber(fiber)
	} else {
		workInProgress = next
	}
}

function completeUnitOfFiber(fiber: FiberNode) {
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
