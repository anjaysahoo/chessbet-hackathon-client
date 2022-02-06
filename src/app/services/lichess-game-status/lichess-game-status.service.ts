import {environment} from './../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LichessGameStatusService {
  constructor(private httpClient: HttpClient) {
  }

  getGameStatus(gameId): Observable<any> {
    return this.httpClient.post<any>(
      environment.chessBetAPI + '/lichess-game-status', {gameId}
    );
  }
}
