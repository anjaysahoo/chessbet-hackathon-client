import {UserDataService} from 'src/app/services/user-data/user-data.service';
import {GameListService} from './../../services/game-list/game-list.service';
import {ChessbetContractService} from './../../smart-contract/chessbet-contract/chessbet-contract.service';
import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import Web3 from 'web3';
import {LichessGameStatusService} from 'src/app/services/lichess-game-status/lichess-game-status.service';

declare let window: any;

@Component({
  selector: 'app-new-bet',
  templateUrl: './new-bet.component.html',
  styleUrls: ['./new-bet.component.scss'],
})
export class NewBetComponent implements OnInit {
  @ViewChild('f', {static: false}) bettingForm: NgForm;
  disablePlaceBet: boolean = false;
  betFailure: boolean = false;
  isMetamaskInstalled: boolean = true;
  isGameOver: boolean = false;
  isGameBullet: boolean = false;
  isGameInvalid: boolean = false;
  defaultSideValue = null;

  constructor(
    private chessbetContractService: ChessbetContractService,
    private gameListService: GameListService,
    private userDataService: UserDataService,
    private lichessGameStatusService: LichessGameStatusService
  ) {
  }

  ngOnInit(): void {
    if (typeof window.ethereum == 'undefined') {
      this.disablePlaceBet = true;
      this.isMetamaskInstalled = false;
    }
  }

  betSuccess = false;

  // web3:Web3;

  placeBet() {
    console.log(this.bettingForm);
    console.log(
      'GameId :' +
      this.bettingForm.value.gameId +
      'side :' +
      this.bettingForm.value.side +
      'Amount :' +
      this.bettingForm.value.amount
    );
    this.disablePlaceBet = true;

    var arr: string[];
    // arr = this.bettingForm.value.gameId.split(/[/,=]+/)
    arr = this.bettingForm.value.gameId.split('/');
    var finalGameId = '';
    if (arr[arr.length - 1] == 'black') {
      finalGameId = arr[arr.length - 2];
    } else {
      finalGameId = arr[arr.length - 1];
    }
    console.log('final game Id : ' + finalGameId);

    this.lichessGameStatusService
      .getGameStatus(finalGameId)
      .subscribe((resp) => {
        console.log('Lichess response : ' + JSON.stringify(resp));

        if (resp["clock"]["initial"] <180) {
          this.isGameBullet = true;
          this.disablePlaceBet = false;
        } else if (resp.status == 'started') {
          const finalAmountInWei = Web3.utils.toWei(
            this.bettingForm.value.amount.toString(),
            'ether'
          );
          // const finalAmount=this.bettingForm.value.amount*10e17;
          this.chessbetContractService
            .getChessbetContract()
            .methods.placeBet(
            finalGameId,
            this.bettingForm.value.side,
            finalAmountInWei
          )
            .send({value: finalAmountInWei})
            .then((data) => {
              this.betSuccess = true;
              this.disablePlaceBet = false;
              this.gameListService.createGameList();
              console.log(JSON.stringify(data));
              this.userDataService.createUserData(
                this.chessbetContractService.getActiveUserAccount()
              );
            })
            .catch((error) => {
              this.disablePlaceBet = false;
              this.betFailure = true;
              console.log('Error recieved :' + error);
            });
        } else {
          this.isGameOver = true;
          this.disablePlaceBet = false;
        }

      }, (error) => {
        console.log('lichess error :' + JSON.stringify(error));
        this.isGameInvalid = true;
        this.disablePlaceBet = false;

      });
  }

  placeAnotherBet() {
    this.betSuccess = false;
  }

  tryAgain() {
    this.betFailure = false;
    this.isGameOver = false;
    this.isGameBullet = false;
    this.isGameInvalid = false;
  }
}
