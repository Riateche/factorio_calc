import { TestBed, inject } from '@angular/core/testing';

import { DropdownListsService } from './dropdown-lists.service';

describe('DropdownListsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DropdownListsService]
    });
  });

  it('should be created', inject([DropdownListsService], (service: DropdownListsService) => {
    expect(service).toBeTruthy();
  }));
});
