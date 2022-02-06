import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChessbetContractService {

  chessBetContract: any;
  activeUserAccount: string;


  constructor() {

  }

  setChessbetContract(val) {
    this.chessBetContract = val;
    console.log('contract' + val);
  }

  getChessbetContract() {
    return this.chessBetContract;
  }

  setActiveUserAccount(val) {
    this.activeUserAccount = val;
  }

  getActiveUserAccount() {
    return this.activeUserAccount;
  }


}




