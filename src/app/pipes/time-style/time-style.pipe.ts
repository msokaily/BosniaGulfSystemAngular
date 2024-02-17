import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'timeStyle'
})
export class TimeStylePipe implements PipeTransform {

  constructor(
    private sanitized: DomSanitizer,
    private translate: TranslateService
  ) {}

  transform(value: string, ...args: unknown[]) {
    let color = 'rgba(255, 255, 255, 0.6)';
    if (args[0] === 'inactive') {
      color = 'rgba(0, 0, 0, 0.6)';
    }
    let trans: any = [];
    this.translate.get(['common.am', 'common.pm']).subscribe(v => trans = v);
    return this.sanitized.bypassSecurityTrustHtml(value.toLowerCase()
      .replace('am', `<span style="color: ${color}; font-size: 14px;">${trans['common.am']}</span>`)
      .replace('pm', `<span style="color: ${color}; font-size: 14px;">${trans['common.pm']}</span>`));
  }

}
