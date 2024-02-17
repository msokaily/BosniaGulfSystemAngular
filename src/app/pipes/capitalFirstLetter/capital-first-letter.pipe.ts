import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalFirstLetter'
})
export class CapitalFirstLetterPipe implements PipeTransform {

  transform(value: any,...args: any): any {
    return value?.charAt(0).toUpperCase() + value?.slice(1);
  }

}
