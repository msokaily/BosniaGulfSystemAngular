import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortString'
})
export class ShortStringPipe implements PipeTransform {

  transform(value: string,...args: any): any {
    let tail = '';
    if (!args[0]) {args[0] = 4;}
    if (value.length > args[0]) { tail = '...'; }
    return `${value.split(' ').slice(0, args[0]).join(' ')}`;
  }

}
