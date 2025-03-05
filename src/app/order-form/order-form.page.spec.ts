import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderFormPage } from './order-form.page';

describe('OrderFormPage', () => {
  let component: OrderFormPage;
  let fixture: ComponentFixture<OrderFormPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(OrderFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
