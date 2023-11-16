import {
	unstable_ImmediatePriority as ImmediatePriority,
	unstable_UserBlockingPriority as UserBlockingPriority,
	unstable_NormalPriority as NormalPriority,
	unstable_LowPriority as LowPriority,
	unstable_IdlePriority as IdlePriority,
	unstable_scheduleCallback as scheduleCallback,
	unstable_shouldYield as shouldYield
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

function schedule() {
	const curWork = workList.sort((w1, w2) => w1.priority - w2.priority)[0]

	/**
	 * TODO 策略模式
	 * 满足则开始调度
	 */

	const { priority } = curWork
	scheduleCallback(priority, perform.bind(null, curWork))
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
	if (!work.count) {
		const workIndex = workList.indexOf(work)
		workList.splice(workIndex, 1)
	}

	// schedule()
	return perform.bind(null, work)
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
