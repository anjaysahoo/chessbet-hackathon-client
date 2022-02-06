import {ResultsListService} from './../../services/result-list/results-list.service';
import {Component, OnInit} from '@angular/core';
import {Sort} from '@angular/material/sort';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

declare var $: any;

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {

  list: any[];
  numbersOfRow: number;
  searchText: string = '';
  sortedData: any[];
  gamelink: string = '';
  trustedGamelink: SafeResourceUrl;


  constructor(private sanitizer: DomSanitizer, private resultListService: ResultsListService) {

  }

  ngOnInit(): void {
    this.resultListService.getResultList().subscribe((resp) => {
      // console.log("response for results : "+JSON.stringify(resp));

      this.list = resp.matches;
      // console.log("value : "+this.list[0].matchID);
      this.sortedData = this.list.slice();
      this.numbersOfRow = this.list.length;
    });
  }

  onPageChange(event) {
    // console.log(event);
    this.sortedData = this.list.slice(event.pageIndex * event.pageSize, event.pageIndex * event.pageSize + event.pageSize);

  }

  showGamePreview(val) {
    this.gamelink = 'https://lichess.org/embed/' + val + '?theme=auto&bg=auto';
    this.trustedGamelink = this.sanitizer.bypassSecurityTrustResourceUrl(this.gamelink);
    console.log('game link : ' + this.gamelink);

    $('#resultGamePreview').modal('show');
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
        // case 'slNo': return compare(a.slNo, b.slNo, isAsc);
        case 'gameId':
          return compare(a.gameId, b.gameId, isAsc);
        case 'blackBettor':
          return compare(a.blackBettor, b.blackBettor, isAsc);
        case 'blackAmount':
          return compare(a.blackAmount, b.blackAmount, isAsc);
        case 'whiteBettor':
          return compare(a.whiteBettor, b.whiteBettor, isAsc);
        case 'whiteAmount':
          return compare(a.whiteAmount, b.whiteAmount, isAsc);
        case 'totalAmount':
          return compare(a.totalAmount, b.totalAmount, isAsc);
        // case 'status': return compare(a.status, b.status, isAsc);
        // case 'duration': return compare(a.duration, b.duration, isAsc);
        case 'winner':
          return compare(a.winner, b.winner, isAsc);

        default:
          return 0;
      }
    });
  }

}


function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);

}
