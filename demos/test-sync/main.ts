const button = document.querySelector('button')
const root = document.querySelector('#root')

interface Work {
	count: number
}

const workList: Work[] = []

function schedule() {
	const curWork = workList.pop()

	if (curWork) {
		perform(curWork)
	}
}

function perform(work: Work) {
	while (work.count) {
		work.count--
		insertDiv(work.count + '')
	}
	schedule()
}

function insertDiv(content: string) {
	const div = document.createElement('div')
	div.innerText = content
	root?.appendChild(div)
}

button &&
	(button.onclick = () => {
		workList.unshift({
			count: 100
		})
		schedule()
	})
