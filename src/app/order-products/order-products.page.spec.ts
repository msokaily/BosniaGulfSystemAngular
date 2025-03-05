import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderProductsPage } from './order-products.page';

describe('OrderProductsPage', () => {
  let component: OrderProductsPage;
  let fixture: ComponentFixture<OrderProductsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(OrderProductsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
