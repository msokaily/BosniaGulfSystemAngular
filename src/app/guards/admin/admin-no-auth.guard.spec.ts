import { TestBed } from '@angular/core/testing';

import { AdminNoAuthGuard } from './admin-no-auth.guard';

describe('AdminNoAuthGuard', () => {
  let guard: AdminNoAuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AdminNoAuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
