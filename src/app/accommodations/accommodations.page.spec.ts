import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccommodationsPage } from './accommodations.page';

describe('AccommodationsPage', () => {
  let component: AccommodationsPage;
  let fixture: ComponentFixture<AccommodationsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AccommodationsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
