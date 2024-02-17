import { CapitalFirstLetterPipe } from './capital-first-letter.pipe';

describe('capitalFirstLetterPipe', () => {
  it('create an instance', () => {
    const pipe = new CapitalFirstLetterPipe();
    expect(pipe).toBeTruthy();
  });
});
