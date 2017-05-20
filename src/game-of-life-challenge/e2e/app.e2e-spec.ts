import { GameOfLifeChallengePage } from './app.po';

describe('game-of-life-Challenge App', () => {
  let page: GameOfLifeChallengePage;

  beforeEach(() => {
    page = new GameOfLifeChallengePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
