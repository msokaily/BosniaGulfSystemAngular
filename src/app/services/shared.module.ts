import { NgModule } from '@angular/core';
import { FilterPipe } from '../pipes/filter/filter.pipe';
import { TimeStylePipe } from '../pipes/time-style/time-style.pipe';
import { SafeHtmlPipe } from '../pipes/safe-html/safe-html.pipe';
import { FullNamePipe } from '../pipes/fullName/full-name.pipe';
import { FullAddressPipe } from '../pipes/fullAddress/full-address.pipe';
import { ShortStringPipe } from '../pipes/short-string/short-string.pipe';
import { McurrencyPipe } from './../pipes/mcurrency/mcurrency.pipe';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { CapitalFirstLetterPipe } from '../pipes/capitalFirstLetter/capital-first-letter.pipe';
import { CanPipe } from '../can.pipe';
import { JsonDecodePipe } from '../pipes/json-decode.pipe';

@NgModule({
  declarations: [McurrencyPipe, FilterPipe, TimeStylePipe, SafeHtmlPipe, FullNamePipe, FullAddressPipe, ShortStringPipe, CapitalFirstLetterPipe, CanPipe, JsonDecodePipe],
  exports: [McurrencyPipe, FilterPipe, TimeStylePipe, SafeHtmlPipe, FullNamePipe, FullAddressPipe, ShortStringPipe, TranslatePipe, CapitalFirstLetterPipe, CanPipe, JsonDecodePipe],
  providers: [DatePipe, McurrencyPipe, FilterPipe, TimeStylePipe, SafeHtmlPipe, FullNamePipe, FullAddressPipe, ShortStringPipe, TranslatePipe, CapitalFirstLetterPipe, CanPipe, JsonDecodePipe],
  imports: [
    TranslateModule
  ]
})
export class SharedModule { }
