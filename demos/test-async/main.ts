import { CallbackNode } from 'scheduler'
import {
	unstable_ImmediatePriority as ImmediatePriority,
	unstable_UserBlockingPriority as UserBlockingPriority,
	unstable_NormalPriority as NormalPriority,
	unstable_LowPriority as LowPriority,
	unstable_IdlePriority as IdlePriority,
	unstable_scheduleCallback as scheduleCallback,
	unstable_shouldYield as shouldYield,
	unstable_getFirstCallbackNode as getFirstCallbackNode,
	unstable_cancelCallback as cancelCallback
} from 'scheduler'

const button = document.querySelector('button')
const root = document.querySelector('#root')

type Priority =
	| typeof ImmediatePriority
	| typeof UserBlockingPriority
	| typeof NormalPriority
	| typeof LowPriority
	| typeof IdlePriority

interface Work {
	count: number
	priority: Priority
}

const workList: Work[] = []
let prevPriority: Priority = IdlePriority
let curCallback: CallbackNode | null = null

function schedule() {
	const cbNode = getFirstCallbackNode()
	const curWork = workList.sort((w1, w2) => w1.priority - w2.priority)[0]

	// 策略逻辑
	if (!curWork) {
		curCallback = null
		cbNode && cancelCallback(cbNode)
		return
	}

	const { priority: curPriority } = curWork

	if (curPriority === prevPriority) {
		return
	}

	// 出现了更高优先级的work
	// 先取消之前调度的任务
	cbNode && cancelCallback(cbNode)

	curCallback = scheduleCallback(curPriority, perform.bind(null, curWork))
}

function perform(work: Work, didTimeout?: boolean) {
	/**
	 * 1. work.priority
	 * 2. 饥饿问题
	 * 3. 时间切片
	 */

	const needSync = work.priority === ImmediatePriority || didTimeout

	while ((needSync || !shouldYield) && work.count) {
		work.count--
		insertDiv(work.count + '')
	}

	// 执行完 || 中断执行
	prevPriority = work.priority
	if (!work.count) {
		const workIndex = workList.indexOf(work)
		workList.splice(workIndex, 1)
		prevPriority = IdlePriority
	}

	/**
	 * 这里调用一下schedule
	 * schedule执行后，如果优先级没有改变，会走到 curPriority === prevPriority，然后return，curCallback不会改变
	 */
	const prevCallback = curCallback
	schedule()
	const newCallback = curCallback

	/**
	 * curCallback不会改变，那么prevCallback和newCallback是相等的
	 * 那么就返回一个函数，让scheduleCallback继续处理相同优先级的任务，不开启新的调度
	 */
	if (newCallback && newCallback === prevCallback) {
		return perform.bind(null, work)
	}
}

function insertDiv(content: string) {
	const div = document.createElement('div')
	div.innerText = content
	root?.appendChild(div)
}

button &&
	(button.onclick = () => {
		workList.unshift({
			count: 100,
			priority: ImmediatePriority
		})
		schedule()
	})
