import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotAuthedPage } from './not-authed.page';

describe('NotAuthedPage', () => {
  let component: NotAuthedPage;
  let fixture: ComponentFixture<NotAuthedPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(NotAuthedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
