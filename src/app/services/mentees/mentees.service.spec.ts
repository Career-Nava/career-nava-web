import { TestBed } from '@angular/core/testing';

import { MenteesService } from './mentees.service';

describe('MenteesService', () => {
  let service: MenteesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenteesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
