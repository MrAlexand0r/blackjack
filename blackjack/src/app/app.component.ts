import { Component } from '@angular/core';
import { Player } from './entities/player';
import { Status } from './enums/status.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'blackjack';
  rotation = 30;
  players: Array<Player> = [];
  rotations: Array<number> = [22, 10, 0, -10, -22];
  
  constructor(){
    for(let i = 0; i < 5; i++){
      this.players.push(new Player("Alexander", 666, 21, Status.WAITING, 0, []));
    }
    
  }
}
