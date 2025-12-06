import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTestmonials } from './manage-testmonials';

describe('ManageTestmonials', () => {
  let component: ManageTestmonials;
  let fixture: ComponentFixture<ManageTestmonials>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageTestmonials]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageTestmonials);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
