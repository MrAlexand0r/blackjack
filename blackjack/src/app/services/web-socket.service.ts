import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  players : Observable<any> = new Observable(observer => this.playersObserver = observer);
  playersObserver:any;
  
  constructor() { 
    let ws = new WebSocket("wss://blackjack-cookiealex.c9users.io:8080/blackjack");
    
    ws.onopen = ()=>{
      console.log("connected");
    }
    console.log(ws.onmessage);

    

    ws.onmessage = (event) => {
      debugger;
      console.log(event);
      var jsonMsg = JSON.parse(event.data);
      switch (jsonMsg.type) {
        case "joined":
          break;
        case "players":
          this.playersObserver.next(jsonMsg);
          break;
        case "turn":
          break;
      }
    };
    
  }
  
  getPlayers() : Observable<any>{
    return this.players;
  }
  
}
