import { TestBed } from '@angular/core/testing';

import { MentorsService } from './mentors.service';

describe('MentorsService', () => {
  let service: MentorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MentorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
