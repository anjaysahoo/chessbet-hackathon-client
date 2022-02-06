import {environment} from 'src/environments/environment';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResultsListService {
  mode: string;

  constructor(private httpClient: HttpClient) {
  }

  setMode(mode){
    this.mode = mode;
  }

  getResultList(): Observable<any> {
    console.log("Result Service Mode : "+this.mode);

    return this.httpClient.get<any>(environment.chessBetAPI + '/history/' + this.mode);
  }

}
