import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RepairsPage } from './repairs.page';

describe('RepairsPage', () => {
  let component: RepairsPage;
  let fixture: ComponentFixture<RepairsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(RepairsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
