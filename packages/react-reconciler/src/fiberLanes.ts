export type Lane = number // 二进制位，代表优先级，作为update的优先级
export type Lanes = number // 二进制位，代表Lane的集合

// 使用二进制来便于后续组合选出多个优先级
export const SyncLane = 0b0001
export const NoLane = 0b0000
export const NoLanes = 0b0000

export function mergeLanes(landA: Lane, landB: Lane): Lanes {
	return landA | landB
}

export function requestUpdateLanes() {
	return SyncLane
}
