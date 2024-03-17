import {Injectable} from "@nestjs/common";

export class UnableTossException extends Error {
    constructor() {
        super("Unable perform toss");
    }
}

export type TossResult = {from: number; to: number};

@Injectable()
export class TossService {
    private static readonly MIN_TOSS_SIZE = 3;

    toss(memberIds: number[]): TossResult[] {
        if (memberIds.length <= TossService.MIN_TOSS_SIZE) {
            throw new UnableTossException();
        }

        const result = [];

        for (let i = 0; i < memberIds.length - 1; i++) {
            result.push({from: memberIds[i], to: memberIds[i + 1]});
        }
        result.push({from: memberIds[memberIds.length - 1], to: memberIds[0]});

        return result;
    }
}
