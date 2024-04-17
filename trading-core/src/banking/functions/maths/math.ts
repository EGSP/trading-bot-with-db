
export module math {
    export function getPercentile(value: number, percent: number): number {
        return value * (percent / 100);
    }

    export function getPercentDifferenceAbs(a:number, b: number) : number{
        return 100 * (Math.abs(a - b) / (Math.abs(a + b) / 2));
    }

    export function getPercentDifference(a:number, b:number) : number{
        return (a - b)/100
    }

    export function addPercent(value: number, percent: number) : number{
        return value + ((value/100) * percent)
    }
}