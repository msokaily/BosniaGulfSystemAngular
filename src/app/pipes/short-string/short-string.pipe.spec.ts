import { ShortStringPipe } from './short-string.pipe';

describe('shortStringPipe', () => {
  it('create an instance', () => {
    const pipe = new ShortStringPipe();
    expect(pipe).toBeTruthy();
  });
});
