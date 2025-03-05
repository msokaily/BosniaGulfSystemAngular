import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExtraServicesPage } from './extra-services.page';

describe('ExtraServicesPage', () => {
  let component: ExtraServicesPage;
  let fixture: ComponentFixture<ExtraServicesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ExtraServicesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
