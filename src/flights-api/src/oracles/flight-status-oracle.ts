export class FlightStatusOracles {
    private oracles: FlightStatusOracle[] = [];

    constructor() {
    }

    add(oracle: FlightStatusOracle) {
        this.oracles.push(oracle);
    }

    findWithIndex(idx: number): FlightStatusOracle[] {
        return this.oracles
                   .filter(o => o.indexes.some(i => i === idx));
    }

    toString() {
        return this.oracles;
    }
}

export class FlightStatusOracle {
    constructor(private readonly id: number,
                public readonly account: string,
                public readonly indexes: number[]) {
    }

    toString(): string {
        return `FlightStatusOracle(id=${this.id},account=${this.account},indexes=[${this.indexes.toString()}])`;
    }
}
