import {ChessbetContractService} from './../../smart-contract/chessbet-contract/chessbet-contract.service';
import {gameList} from './../../models/gameList.model';
import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import Web3 from 'web3';

@Injectable({
  providedIn: 'root',
})
export class GameListService {

  private gameList: gameList[] = [];
  private updatedGameList = new Subject<gameList[]>();

  // web3:Web3;

  constructor(private chessbetContractService: ChessbetContractService) {


  }

  createGameList() {

    this.chessbetContractService
      .getChessbetContract()
      .methods.getActiveGames()
      .call()
      .then(async (activeGameList) => {
        // var batch = new this.web3.eth.BatchRequest();

        // console.log("Active game list : "+JSON.stringify(activeGameList));
        for (let i in activeGameList) {
          await this.chessbetContractService
            .getChessbetContract()
            .methods.getGameDetails(activeGameList[i])
            .call()
            .then((details) => {
              // console.log("Details : "+JSON.stringify(details));
              // console.log(
              //   'Game ID : ' +
              //     details[0].gameId +
              //     ' Balck Amount: ' +
              //     details[0].amountBlack +
              //     ' White Amount : ' +
              //     details[0].amountWhite +
              //     ' Total Bettor : ' +
              //     details[0].numberBets
              // );

              this.gameList.push({
                slNo: parseInt(i) + 1,
                gameId: activeGameList[i],
                blackAmount: Web3.utils.fromWei(details[0].amountBlack.toString(), 'ether'),
                totalBettor: details[0].numberBets,
                whiteAmount: Web3.utils.fromWei(details[0].amountWhite.toString(), 'ether')
              });
            })
            .catch((error) => {
              console.log('Error recieved :' + error);
            });
        }

        this.updatedGameList.next([...this.gameList]);
        // console.log(this.gameList)
        this.gameList = [];
        // console.log(this.updatedGameList.asObservable())

      })
      .catch((error) => {
        console.log('Error recieved :' + error);
      });

    return this.gameList;
  }

  getGameList() {
    return this.updatedGameList.asObservable();
  }


}
