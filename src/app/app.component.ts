import {ResultsListService} from './services/result-list/results-list.service';
import {RoutingService} from './services/routing/routing.service';
import {ChessbetContractService} from './smart-contract/chessbet-contract/chessbet-contract.service';
import {Component} from '@angular/core';
import Web3 from 'web3';
import * as data from './smart-contract/config.json';
import {ActivatedRoute, Router} from '@angular/router';
import { CookieService } from './services/cookies/cookies.service';

declare let window: any;
declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'trial';
  web3: Web3;
  userAccount: string = null;
  configData: any = (data as any).default;
  metamaskInstalled: boolean = true;
  startLiveBet: boolean = false;
  startClaimComponent: boolean = false;
  startResultComponent: boolean = false;
  startFaqComponent: boolean = false;
  chainId: number = 0;
  isChainCorrect: boolean = false;
  mode: string;
  shouldShowBanner:boolean;


  constructor(private router: Router, private chessbetContractService: ChessbetContractService, private activatedRoute: ActivatedRoute, private resultsListService: ResultsListService) {

    let firstTimeCookie = CookieService.getCookie("firstTimeCookie");
    this.shouldShowBanner = !firstTimeCookie;



     this.activatedRoute.queryParams.subscribe((params) => {
      // console.log("Params : " + params["mode"]);

      if (params["mode"] === "testnet") {
        this.mode = "testnet";
        this.chainId = 80001;

      } else if (!params["mode"]) {
        let params = JSON.parse(JSON.stringify(this.activatedRoute.snapshot.queryParams));
        params["mode"] = "testnet";
        this.router.navigate([], {queryParams: params}).then(() => {
        });
      } else {
        this.mode = "testnet";
        this.chainId = 80001;
      }

      // else {
      //   this.mode = "mainnet";
      //   this.chainId = 137;
      //
      // }

      setTimeout(() => {
        this.startResultComponent = true;
        this.startFaqComponent = true;
      }, 500);

      this.resultsListService.setMode(this.mode);

    });
    console.log('Constructor Called');
    this.callConnectWallet();
  }


  ngOnIt(): void {
    console.log('ngOnit called');
  }

  openChainList() {
    window.open('https://chainlist.org/?search=polygon%20' + this.mode, '_blank');
  }


  callConnectWallet() {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.enable();
      this.web3 = new Web3(window.ethereum);

      /****** Request user to switch chain *****/
      window.ethereum.request({method: 'eth_chainId'}).then((chainId: any) => {
        console.log('chain Id : ' + chainId);
        if (chainId != this.chainId) {
          $('#chainModal').modal('show');
        }

      }).catch((err: any) => {
        console.log('Unable to get chainId.\nErr:');
        console.log(err);
      });


      /****** Request metamask for wallet connection   *****/

      window.ethereum.request({method: 'eth_requestAccounts'}).then((result) => {
        console.log('wallet connect request result : ' + result);


      }).catch((error) => {
        console.log('wallet connect request error : ' + error);
        $('#userConnectionModal').modal('show');

      });


      /*** Get all connected wallet in Metamask **********/
      this.web3.eth.getAccounts().then((acc: any) => {
        this.userAccount = <string>acc[0];
        this.chessbetContractService.setChessbetContract(new this.web3.eth.Contract(this.configData.contractABI, this.web3.utils.toChecksumAddress(this.configData[this.mode + "ContractAddress"]), {
          from: this.userAccount
        }));

        this.chessbetContractService.setActiveUserAccount(this.userAccount);
        console.log("Before startLiveBet Mode : " + this.mode);

        this.startLiveBet = true;
        this.startClaimComponent = true;
        // this.userAccount.next(<String>acc[0]) ;
        console.log('Connected Account : ' + this.userAccount);
      }).catch(console.log);


      /******Background Listner to check whether user is changing his account ***/
      window.ethereum.on('accountsChanged', (acc: any) => {
        this.userAccount = <string>acc[0];
        console.log('Account Changed to : ' + this.userAccount);
        window.location.reload();

      });
      window.ethereum.on('chainChanged', () => {
        // Handle the new chain.
        // Correctly handling chain changes can be complicated.
        // We recommend reloading the page unless you have good reason not to.
        console.log('chainChanged detecting method called');
        window.location.reload();
      });
    } else {
      this.startLiveBet = true;
      this.startClaimComponent = true;
      console.error('No Web3 Support Found. Please Consider Using MetaMask, etc');
      this.metamaskInstalled = false;
      this.web3 = new Web3();
      this.userAccount = null;
    }

  }


  claimAskingToConnectWallet(evt) {
    console.log(evt);
    this.callConnectWallet();
  }

  connectWallet() {
    this.callConnectWallet();
  }

  setBannerCookie(){
    this.shouldShowBanner = false
    CookieService.setCookie({
      name: "firstTimeCookie",
      value: "true",
      expireDays: 15
    });
  }

}
