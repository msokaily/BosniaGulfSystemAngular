import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarCompaniesPage } from './car-companies.page';

describe('CarCompaniesPage', () => {
  let component: CarCompaniesPage;
  let fixture: ComponentFixture<CarCompaniesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CarCompaniesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
