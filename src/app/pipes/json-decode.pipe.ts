import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'jsonDecode'
})
export class JsonDecodePipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return JSON.parse(value);
  }

}
