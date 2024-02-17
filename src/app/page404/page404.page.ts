/* eslint-disable @angular-eslint/no-host-metadata-property */
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-page404',
  templateUrl: './page404.page.html',
  styleUrls: ['./page404.page.scss'],
  host: { class: 'ministore-page' }
})
export class Page404Page implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
