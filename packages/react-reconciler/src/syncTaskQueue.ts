let syncQueue: ((...arg: any) => void)[] | null
let isFlushingSyncQueue = false

export function scheduleSyncCallback(callback: (...arg: any) => void) {
	if (syncQueue === null) {
		syncQueue = [callback]
	} else {
		syncQueue.push(callback)
	}
}

export function flushSyncCallback() {
	if (!isFlushingSyncQueue && syncQueue) {
		isFlushingSyncQueue = true
		try {
			syncQueue.forEach((callback) => callback())
		} catch (e) {
			if (__DEV__) {
				console.error('flushSyncCallback报错', e)
			}
		} finally {
			isFlushingSyncQueue = false
		}
	}
}
