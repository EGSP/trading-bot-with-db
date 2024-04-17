
export class StoplossV2 {
    readonly tickerName : string
    readonly dynamicOffset: number // Процент

    readonly timestamp: number

    constructor(tickerName: string, dynamicOffset: number, timestamp:number) {
        this.tickerName = tickerName;
        this.dynamicOffset = dynamicOffset;
        this.timestamp = timestamp;
    }
}