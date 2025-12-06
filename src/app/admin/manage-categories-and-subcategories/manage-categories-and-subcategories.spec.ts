import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCategoriesAndSubcategories } from './manage-categories-and-subcategories';

describe('ManageCategoriesAndSubcategories', () => {
  let component: ManageCategoriesAndSubcategories;
  let fixture: ComponentFixture<ManageCategoriesAndSubcategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageCategoriesAndSubcategories]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageCategoriesAndSubcategories);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
