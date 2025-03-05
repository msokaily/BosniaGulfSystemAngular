import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopupInfoPage } from './popup-info.page';

describe('PopupInfoPage', () => {
  let component: PopupInfoPage;
  let fixture: ComponentFixture<PopupInfoPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PopupInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
