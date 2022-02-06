import { Component, OnInit, Input } from '@angular/core';
import * as data from '../../smart-contract/config.json';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {

  token:string='$MATIC'
  configData: any = (data as any).default;
  @Input() mode: String;
  contractAddress:string;

  constructor() {
  }

  ngOnInit(): void {
    this.contractAddress = this.configData["testnetContractAddress"];

    /******** After Mainnet release uncomment below lines  ***********/

    // if(this.mode === "testnet"){
    //   this.contractAddress=this.configData["testnetContractAddress"]
    // }
    // else
    // {
    //   this.contractAddress=this.configData["mainnetContractAddress"]
    // }
  }

}
