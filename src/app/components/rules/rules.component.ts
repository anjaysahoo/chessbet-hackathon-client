import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss']
})
export class RulesComponent implements OnInit {

  minimumAmountToBet:number = 1;
  token:string='$MATIC';
  feesAmount:number = 2;

  constructor() {
  }

  ngOnInit(): void {
  }

}
