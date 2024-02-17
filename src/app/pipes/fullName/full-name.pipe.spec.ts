import { FullNamePipe } from './full-name.pipe';

describe('fullNamePipe', () => {
  it('create an instance', () => {
    const pipe = new FullNamePipe();
    expect(pipe).toBeTruthy();
  });
});
