import {LichessGameStatusService} from './../../services/lichess-game-status/lichess-game-status.service';
import {UserDataService} from 'src/app/services/user-data/user-data.service';
import {ChessbetContractService} from './../../smart-contract/chessbet-contract/chessbet-contract.service';
import {NgForm} from '@angular/forms';
import {gameList} from './../../models/gameList.model';
import {GameListService} from './../../services/game-list/game-list.service';
import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Sort} from '@angular/material/sort';
import {Subscription} from 'rxjs';
import Web3 from 'web3';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

declare var $: any;


@Component({
  selector: 'app-live-bet',
  templateUrl: './live-bet.component.html',
  styleUrls: ['./live-bet.component.scss']
})
export class LiveBetComponent implements OnInit, OnDestroy {

  @ViewChild('f', {static: false}) bettingForm: NgForm;
  list: gameList[];
  numbersOfRow: number;
  // currentItemsToShow=[];
  searchText: string = '';
  sortedData: any[];
  placeBet: boolean = false;
  successMsg: boolean = false;
  selectedGame: string;
  disablePlaceBet: boolean = false;
  failureMsg: boolean = false;
  private gameListSub: Subscription;
  isFetching: boolean = false;
  gamelink: string = '';
  trustedGamelink: SafeResourceUrl;
  isGameIdInvalid: boolean = false;
  isGameOver: boolean = false;
  defaultSideValue = null;

  constructor(private sanitizer: DomSanitizer, private gameList: GameListService, private chessbetContractService: ChessbetContractService, private userDataService: UserDataService, private lichessGameStatusService: LichessGameStatusService) {

  }

  ngOnInit(): void {
    console.log('live bet ngOnit called');
    this.trustedGamelink = this.sanitizer.bypassSecurityTrustResourceUrl(this.gamelink);

    /* If metamask is not installed it help in opening modal */
    $('#exampleModal').modal('show');

    this.isFetching = true;
    this.gameList.createGameList();
    this.gameListSub = this.gameList.getGameList().subscribe(async (updatedList: gameList[]) => {
      this.list = await updatedList;
      this.sortedData = this.list.slice();
      this.numbersOfRow = this.list.length;
      this.isFetching = false;
      //  console.log("Updated list : "+updatedList)
      //  console.log("List value : "+this.list[0].slNo)
    }, (error) => {
      this.isFetching = false;
      console.log('Subject Error msg :' + error);
    });


    // this.currentItemsToShow=this.list;
  }


  onPageChange(event) {
    // console.log(event);
    this.sortedData = this.list.slice(event.pageIndex * event.pageSize, event.pageIndex * event.pageSize + event.pageSize);

  }

  refreshLiveBet() {
    this.ngOnInit();
  }

  // log(){
  //   console.log(this.searchText)
  // }

  sortData(sort: Sort) {
    const data = this.list.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'slNo':
          return compare(a.slNo, b.slNo, isAsc);
        case 'gameId':
          return compare(a.gameId, b.gameId, isAsc);
        // case 'blackBettor': return compare(a.blackBettor, b.blackBettor, isAsc);
        case 'blackAmount':
          return compare(a.blackAmount, b.blackAmount, isAsc);
        case 'totalBettor':
          return compare(a.totalBettor, b.totalBettor, isAsc);
        case 'whiteAmount':
          return compare(a.whiteAmount, b.whiteAmount, isAsc);

        default:
          return 0;
      }
    });
  }


  betHere(val) {
    this.placeBet = true;
    this.selectedGame = val;
  }

  cancel() {
    this.placeBet = false;
  }

  placeMyBet() {

    console.log('GameId :' + this.bettingForm.value.gameId + 'side :' + this.bettingForm.value.side + 'Amount :' + this.bettingForm.value.amount);
    this.disablePlaceBet = true;

    // var arr:string[];
    // arr = this.bettingForm.value.gameId.split('/')
    // const finalGameId = arr[arr.length-1];
    // const finalAmount=this.bettingForm.value.amount*10e17;

    this.lichessGameStatusService.getGameStatus(this.selectedGame).subscribe((resp) => {
      if (resp.status == 'started') {
        const finalAmountInWei = Web3.utils.toWei(this.bettingForm.value.amount.toString(), 'ether');
        this.chessbetContractService.getChessbetContract().methods.placeBet(this.selectedGame, this.bettingForm.value.side, finalAmountInWei).send({'value': finalAmountInWei}).then((data) => {
          this.placeBet = false;
          this.successMsg = true;
          this.disablePlaceBet = false;
          this.gameList.createGameList();
          this.userDataService.createUserData(this.chessbetContractService.getActiveUserAccount());
          // this.userDataService.createUserData()
          // console.log(JSON.stringify(data))
        }).catch((error) => {
          this.placeBet = false;
          this.failureMsg = true;
          this.disablePlaceBet = false;
          // this.betFailure=true;
          console.log('Error recieved :' + error);
        });
      } else {
        this.isGameOver = true;
        this.placeBet = false;
        this.disablePlaceBet = false;
      }
    }, (error) => {
      console.log('error from lichess in live bets : ' + error);
      this.isGameIdInvalid = true;
      this.placeBet = false;
      this.disablePlaceBet = false;

    });

  }

  placeAnotherBet() {
    this.successMsg = false;
    this.placeBet = false;
  }

  tryAgain() {
    this.failureMsg = false;
    this.placeBet = false;
    this.isGameIdInvalid = false;
    this.isGameOver = false;
  }

  showGamePreview(val) {
    this.gamelink = 'https://lichess.org/embed/' + val + '?theme=auto&bg=auto';
    this.trustedGamelink = this.sanitizer.bypassSecurityTrustResourceUrl(this.gamelink);
    console.log('game link : ' + this.gamelink);

    $('#liveGamePreview').modal('show');
  }

  ngOnDestroy() {
    this.gameListSub.unsubscribe();
  }


}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);

}


