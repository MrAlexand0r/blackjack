import { Status } from '../enums/status.enum';

export class Player {
    constructor(private name:string, private chips:number, private cardValue: number, private status: Status, private currentBet: number, cards: Array<string>){
    }
}