import { Pipe, PipeTransform } from '@angular/core';
import { AuthenticationService } from './services/authentication/authentication.service';

@Pipe({
  name: 'can'
})
export class CanPipe implements PipeTransform {

  constructor(
    private auth: AuthenticationService
  ) {}

  transform(value: string, ...args: any[]): unknown {
    const user = this.auth.getUser();
    if (user && user?.abilities) {
      const abilities: any = user?.abilities;
      if (value && args && args[0] && Array.isArray(args[0])) {
        const checkValues: boolean[] = [];
        args[0].forEach((arg: string) => {
          if (abilities[arg]?.includes(value)) {
            checkValues.push(true);
          } else {
            checkValues.push(false);
          }
        });
        return checkValues.includes(false) ? false : true;
      }
      return false;
    }
    return false;
  }

}
