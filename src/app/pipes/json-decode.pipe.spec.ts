import { JsonDecodePipe } from './json-decode.pipe';

describe('JsonDecodePipe', () => {
  it('create an instance', () => {
    const pipe = new JsonDecodePipe();
    expect(pipe).toBeTruthy();
  });
});
