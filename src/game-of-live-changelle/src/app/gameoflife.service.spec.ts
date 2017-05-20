import { TestBed, inject } from '@angular/core/testing';

import { GameoflifeService } from './gameoflife.service';

describe('GameoflifeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GameoflifeService]
    });
  });

  it('should ...', inject([GameoflifeService], (service: GameoflifeService) => {
    expect(service).toBeTruthy();
  }));
});
