import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(value: any[],...args: any): any[] {
    
    return value.filter(v => {
      if ((typeof args[0]) === "object") {
        // console.log(v, args);
        for (let i = 0; i < args[0].length; i++) {
          if (v[args[0][i]] && v[args[0][i]].toLowerCase().includes(args[1].toLowerCase())) {
            return true;
          }
        }
      }else {
        if ((typeof args[1]) === "object" && (typeof args[0]) === "string") {
          for (let i = 0; i < args[1].length; i++) {
            if (v[args[0]] && v[args[0]].toLowerCase().includes(args[1][i].toLowerCase())) {
              return true;
            }
          }
        } else {
          return v[args[0]].toLowerCase().includes(args[1].toLowerCase());
        }
      }
    });
  }

}
