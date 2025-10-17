import { TestBed } from '@angular/core/testing';

import { ScholarshipsService } from './scholarships.service';

describe('ScholarshipsService', () => {
  let service: ScholarshipsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScholarshipsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
