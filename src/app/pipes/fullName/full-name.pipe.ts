import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fullName'
})
export class FullNamePipe implements PipeTransform {

  transform(value: any,...args: any): any {
    return `${value?.firstName} ${value?.lastName}`;
  }

}
