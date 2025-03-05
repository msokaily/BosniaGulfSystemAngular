import { firstValueFrom } from 'rxjs';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { CanPipe } from '../can.pipe';
import { SharedService } from '../services/shared.service';

export const CanOpenRoute: CanActivateFn = async(
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  if (inject(CanPipe).transform(route?.data['permName'] ?? route?.data['name'], route?.data['perms'] ?? ['view'])) {
    return true;
  } else {
    inject(SharedService).navRoot('not-authed', {
      skipLocationChange: true
    });
  }
  return false;
};