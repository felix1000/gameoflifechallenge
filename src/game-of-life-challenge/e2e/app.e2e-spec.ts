import { GameOfLiveChangellePage } from './app.po';

describe('game-of-live-changelle App', () => {
  let page: GameOfLiveChangellePage;

  beforeEach(() => {
    page = new GameOfLiveChangellePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
