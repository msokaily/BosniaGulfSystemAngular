import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(value: any[],...args: any): any[] {
    return value.filter(v => {
      // eslint-disable-next-line @typescript-eslint/quotes
      if ((typeof args[0]) === "object") {
        // console.log(v, args);
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < args[0].length; i++) {
          if (v[args[0][i]] && v[args[0][i]].toLowerCase().includes(args[1].toLowerCase())) {
            return true;
          }
        }
      }else {
        return v[args[0]].toLowerCase().includes(args[1].toLowerCase());
      }
    });
  }

}
