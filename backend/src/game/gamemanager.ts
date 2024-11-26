type player = {
    id: number,
    username: string,
    auth: string
}
type cell = 0
| 11
| 12
| 13
| 14
| 15
| 21
| 22
| 23
| 24
| 25
| 3
| 4
type field = Array<cell>
export class GameManager {
    private player1;
    private player2;
    private gameid;
    private selffields;
    private enemyfields;

    private idToPlayer;
    constructor(p1 : player, p2: player, gid){
        this.player1 = p1;
        this.player2 = p2;
        this.gameid = gid;
        this.selffields=[this.generateEmptyField(0),this.generateEmptyField(0)];
        this.enemyfields=[this.generateEmptyField(3),this.generateEmptyField(3)];
        this.idToPlayer = {
            [this.player1.id] : 0,
            [this.player2.id] : 1
        }
    }

    generateEmptyField(n : number){
        return new Array(12*12).fill(n);
    }

    placeShips(p : number, field : field) : boolean{
        const res = field.reduce((prev, item)=>{
            return prev+item;
        },0)
        if (res!=187) return false 
        this.selffields[this.idToPlayer[p]] = [...field];
        console.log(this.selffields)
        return true;
    }

}