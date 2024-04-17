
export class Ticker {
    // @ts-ignore
    readonly first: string = undefined;
    // @ts-ignore
    readonly last: string = undefined;

    constructor(first: string, last: string) {
        this.first = first;
        this.last = last;
    }

    toString():string {
        // @ts-ignore
        return this.getName()
    }

    getName() : string|undefined {
        if(this.first !== undefined && this.last !== undefined)
            return this.first + this.last;
        return undefined
    }
}
