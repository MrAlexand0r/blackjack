import { Component, OnInit, Input } from '@angular/core';
import { Player } from '../../entities/player';
import {Status} from '../../enums/status.enum';

@Component({
  selector: 'app-playerspot',
  templateUrl: './playerspot.component.html',
  styleUrls: ['./playerspot.component.scss']
})
export class PlayerspotComponent implements OnInit {

  @Input()
  player: Player;
  
  @Input()
  rotation: number;
  
  constructor() { 
    }

  ngOnInit() {
  }

}
