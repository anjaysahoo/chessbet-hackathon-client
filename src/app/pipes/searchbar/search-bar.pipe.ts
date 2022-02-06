import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'searchBar'
})
export class SearchBarPipe implements PipeTransform {

  transform(items: any[], searchText: string, findingList: any[]): any[] {
    if (!items) {
      return [];
    }
    if (!searchText) {
      return items;
    }
    searchText = searchText.toLowerCase();
    return findingList.filter(it => {


      return JSON.stringify(it).toLowerCase().includes(searchText.toLowerCase());

    });
  }

}
