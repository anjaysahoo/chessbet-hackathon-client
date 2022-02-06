import {Subscription} from 'rxjs';
import {ChessbetContractService} from './../../smart-contract/chessbet-contract/chessbet-contract.service';
import {Sort} from '@angular/material/sort';
import {userData} from './../../models/userData.model';
import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {UserDataService} from 'src/app/services/user-data/user-data.service';
import {userList} from 'src/app/models/userList.model';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';


declare var $: any;

@Component({
  selector: 'app-claim',
  templateUrl: './claim.component.html',
  styleUrls: ['./claim.component.scss']
})
export class ClaimComponent implements OnInit, OnDestroy {

  @Input() blurred: boolean = true;

  list: userList[] = [];
  numbersOfRow: number;
  searchText: string = '';
  sortedData: any[];
  @Output() notifyParentToConnectWallet: EventEmitter<any> = new EventEmitter<any>();
  @Input() activeUserAccount: String;
  win: number;
  loss: number;
  draw: number;
  claimAmount: string;
  isClaiming: boolean = false;
  private userDataSub: Subscription;
  gamelink: string = '';
  trustedGamelink: SafeResourceUrl;
  isFetching: boolean = false;


  constructor(private sanitizer: DomSanitizer, private userDataService: UserDataService, private chessbetContractService: ChessbetContractService) {
    this.sortedData = this.list.slice();

    // this.setActiveUserAccount()
    console.log('claim contructor called');
    console.log('activeUserAccount: ' + this.activeUserAccount);
  }

  showClaimMenu() {
    this.notifyParentToConnectWallet.emit('Some value to send to the parent');
  }


  ngOnInit(): void {
    this.isFetching = true;
    this.trustedGamelink = this.sanitizer.bypassSecurityTrustResourceUrl(this.gamelink);
    // console.log("activeUserAccount in ngOninit:  "+this.activeUserAccount)
    if (this.activeUserAccount) {

      this.userDataSub = this.userDataService.getUserData().subscribe(async (upadtedUserData: userData) => {
        this.isFetching = false;
        var details = await upadtedUserData;
        // console.log("details : "+details.gameDetails);

        this.win = details.win;
        this.loss = details.loss;
        this.draw = details.draw;
        this.claimAmount = (Math.round(parseFloat(details.claimAmount) * 10000000) / 10000000).toString();
        // this.claimAmount=parseFloat("10").toString()
        this.list = details.gameDetails;
        this.sortedData = this.list;
        this.numbersOfRow = this.list.length;
        // console.log("List : "+this.list[0].gameId);
      }, (error) => {
        this.isFetching = false;
      });

      this.userDataService.createUserData(this.activeUserAccount);

    }

  }

  ngOnChange(changes: SimpleChanges) {
    this.blurred = false;
    console.log('ngOnChange called : ' + changes);
  }

  refreshStats() {
    this.ngOnInit();
  }


  callClaimRewards() {
    this.isClaiming = true;
    this.chessbetContractService.getChessbetContract().methods.claimRewards().send().then((resp) => {
      // console.log("Response : "+JSON.stringify(resp));
      this.isClaiming = false;
      $('#successfullClaim').modal('show');
      this.userDataService.createUserData(this.activeUserAccount);

    }, (error) => {
      console.log('claim error : ' + error);
      this.isClaiming = false;
      $('#failureClaim').modal('show');
    });
  }


  onPageChange(event) {

    this.sortedData = this.list.slice(event.pageIndex * event.pageSize, event.pageIndex * event.pageSize + event.pageSize);

  }


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
        case 'amountBetted':
          return compare(a.amountBetted, b.amountBetted, isAsc);
        case 'gameResult':
          return compare(a.gameResult, b.gameResult, isAsc);
        case 'yourResult':
          return compare(a.yourResult, b.yourResult, isAsc);
        case 'status':
          return compare(a.status, b.status, isAsc);

        default:
          return 0;
      }
    });
  }


  showGamePreview(val) {
    this.gamelink = 'https://lichess.org/embed/' + val + '?theme=auto&bg=auto';
    this.trustedGamelink = this.sanitizer.bypassSecurityTrustResourceUrl(this.gamelink);
    console.log('game link : ' + this.gamelink);

    $('#userGamePreview').modal('show');
  }

  ngOnDestroy() {
    this.userDataSub.unsubscribe();
  }

}


function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);

}

