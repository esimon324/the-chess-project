import { TheChessProjectPage } from './app.po';

describe('the-chess-project App', () => {
  let page: TheChessProjectPage;

  beforeEach(() => {
    page = new TheChessProjectPage();
  });

  it('should display welcome message', done => {
    page.navigateTo();
    page.getParagraphText()
      .then(msg => expect(msg).toEqual('Welcome to app!!'))
      .then(done, done.fail);
  });
});
