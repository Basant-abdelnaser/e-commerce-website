import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SubcategoriesService } from '../../services/subcategories-service';
import { CategoriesService } from '../../services/categories-service';
interface Category {
  _id: string;
  name: string;
  isActive: boolean;
  subcategories?: Subcategory[];
}

interface Subcategory {
  _id: string;
  name: string;
  category: any;
  isActive: boolean;
}
@Component({
  selector: 'app-manage-categories-and-subcategories',
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-categories-and-subcategories.html',
  styleUrl: './manage-categories-and-subcategories.css',
})
export class ManageCategoriesAndSubcategories implements OnInit {
  categories: Category[] = [];
  subcategories: Subcategory[] = [];

  newCategory = '';
  newSubcategory = '';
  selectedCategoryId: string | null = null;
  editingId: string | null = null;
  editingName = '';
  editingSubId: string | null = null;
  editingSubName = '';

  isLoading = false;
  errorMessage = '';

  constructor(
    private categoryService: CategoriesService,
    private subcategoryService: SubcategoriesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadSubcategories();
  }

  loadCategories() {
    this.isLoading = true;
    this.categoryService.getCatories().subscribe({
      next: (res: any) => {
        this.categories = res.categories || [];
        console.log('Categories loaded:', this.categories);
        this.mapSubcategoriesToCategories();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.errorMessage = 'Failed to load categories';
        this.isLoading = false;
      },
    });
  }

  loadSubcategories() {
    this.subcategoryService.getSubcategories().subscribe({
      next: (res: any) => {
        this.subcategories = res.subCategories || [];
        console.log('Subcategories loaded:', this.subcategories);
        this.mapSubcategoriesToCategories();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading subcategories:', error);
      },
    });
  }

  // Map subcategories to their parent categories
  mapSubcategoriesToCategories() {
    if (this.categories.length > 0 && this.subcategories.length > 0) {
      this.categories = this.categories.map((category) => ({
        ...category,
        subcategories: this.subcategories.filter((sub) => sub.category === category._id),
      }));
    }
  }

  // Get subcategories for a specific category
  getCategorySubcategories(categoryId: string): Subcategory[] {
    // console.log('Getting subcategories for category:', categoryId);
    return this.subcategories.filter((sub) => sub.category?._id === categoryId);
  }

  // Category Operations
  addCategory() {
    if (this.newCategory.trim()) {
      this.categoryService.addNewCategory({ name: this.newCategory }).subscribe({
        next: (res: any) => {
          console.log('Category added:', res);
          this.newCategory = '';
          this.loadCategories();
        },
        error: (error) => {
          console.error('Error adding category:', error);
          alert('Failed to add category. It might already exist.');
        },
      });
    }
  }

  deleteCategory(id: string) {
    if (
      confirm(
        'Are you sure you want to delete this category? All subcategories will also be deleted.'
      )
    ) {
      this.categoryService.deleteCategories(id).subscribe({
        next: (res: any) => {
          console.log('Category deleted:', res);
          this.loadCategories();
          this.loadSubcategories();
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          alert('Failed to delete category');
        },
      });
    }
  }

  startEditCategory(category: Category) {
    this.editingId = category._id;
    this.editingName = category.name;
  }

  saveCategory(id: string) {
    if (this.editingName.trim()) {
      this.categoryService.updateCategory(id, { name: this.editingName }).subscribe({
        next: (res: any) => {
          console.log('Category updated:', res);
          this.editingId = null;
          this.loadCategories();
        },
        error: (error) => {
          console.error('Error updating category:', error);
          alert('Failed to update category. Name might already exist.');
        },
      });
    }
  }

  cancelEdit() {
    this.editingId = null;
    this.editingName = '';
  }

  // Subcategory Operations
  showAddSubcategory(categoryId: string) {
    this.selectedCategoryId = categoryId;
    this.newSubcategory = '';
  }

  addSubcategory(categoryId: string) {
    if (this.newSubcategory.trim()) {
      const subcategoryData = {
        name: this.newSubcategory,
        category: categoryId,
      };

      this.subcategoryService.addNewSubcategory(subcategoryData).subscribe({
        next: (res: any) => {
          console.log('Subcategory added:', res);
          this.newSubcategory = '';
          this.selectedCategoryId = null;
          this.loadSubcategories();
        },
        error: (error) => {
          console.error('Error adding subcategory:', error);
          alert('Failed to add subcategory. It might already exist.');
        },
      });
    }
  }

  cancelAddSubcategory() {
    this.selectedCategoryId = null;
    this.newSubcategory = '';
  }

  deleteSubcategory(subcategoryId: string) {
    if (confirm('Are you sure you want to delete this subcategory?')) {
      this.subcategoryService.deleteSubcategory(subcategoryId).subscribe({
        next: (res: any) => {
          console.log('Subcategory deleted:', res);
          this.loadSubcategories();
        },
        error: (error) => {
          console.error('Error deleting subcategory:', error);
          alert('Failed to delete subcategory');
        },
      });
    }
  }

  startEditSubcategory(subcategory: Subcategory) {
    this.editingSubId = subcategory._id;
    this.editingSubName = subcategory.name;
  }

  saveSubcategory(subcategoryId: string) {
    if (this.editingSubName.trim()) {
      this.subcategoryService
        .updateSubcategory(subcategoryId, {
          name: this.editingSubName,
        })
        .subscribe({
          next: (res: any) => {
            console.log('Subcategory updated:', res);
            this.editingSubId = null;
            this.loadSubcategories();
          },
          error: (error) => {
            console.error('Error updating subcategory:', error);
            alert('Failed to update subcategory. Name might already exist.');
          },
        });
    }
  }

  cancelSubEdit() {
    this.editingSubId = null;
    this.editingSubName = '';
  }

  onKeyPress(event: KeyboardEvent, type: string, categoryId?: string) {
    if (event.key === 'Enter') {
      if (type === 'category') {
        this.addCategory();
      } else if (type === 'subcategory' && categoryId) {
        this.addSubcategory(categoryId);
      }
    }
  }
}
