import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fullAddress'
})
export class FullAddressPipe implements PipeTransform {

  transform(data: any,...args: any): any {
    return `${data?.houseNumber || ''} 
      ${!data?.buildingName || data?.buildingName === '-' ? '' : data?.buildingName} 
      ${!data?.area || data?.area === '-' ? '' : data?.area} 
      ${!data?.street || data?.street === '-' ? '' : data?.street + ','}
      ${!data?.state || data?.state === '-' ? '' : data?.state + ','}
      ${data?.city || ''} 
      ${data?.country || ''}`;
  }

}
