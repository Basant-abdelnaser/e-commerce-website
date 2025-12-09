import { ChangeDetectorRef, Component } from '@angular/core';
import { ProductService } from '../../services/product-service';
import { CategoriesService } from '../../services/categories-service';
import { SubcategoriesService } from '../../services/subcategories-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: any;
  subcategory: any;
  image: string;
  stock: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
}
@Component({
  selector: 'app-manage-products',
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-products.html',
  styleUrl: './manage-products.css',
})
export class ManageProducts {
  products: Product[] = [];
  categories: any[] = [];
  allSubcategories: any[] = [];
  filteredSubcategories: any[] = [];

  // Filters
  selectedCategory: string = 'all';
  searchTerm: string = '';
  showDeletedProducts: boolean = false;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalProducts: number = 0;

  // Modal states
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  // Form data
  productForm: any = {
    name: '',
    description: '',
    price: 0,
    category: '',
    subcategory: '',
    stock: 0,
    image: null,
  };

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  editingProductId: string = '';

  constructor(
    private productService: ProductService,
    private categoryService: CategoriesService,
    private subcategoryService: SubcategoriesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadAllSubcategories();
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    const params: any = {
      page: this.currentPage,
      limit: this.itemsPerPage,
    };

    if (this.selectedCategory !== 'all') {
      params.category = this.selectedCategory;
    }

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    this.productService.getProducts(params).subscribe({
      next: (res: any) => {
        this.products = res.data || [];
        this.totalProducts = res.results || 0;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.errorMessage = 'Failed to load products';
        this.isLoading = false;
      },
    });
  }

  loadCategories() {
    this.categoryService.getCatories().subscribe({
      next: (res: any) => {
        this.categories = res.categories || [];
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error loading categories:', error),
    });
  }

  loadAllSubcategories() {
    this.subcategoryService.getSubcategories().subscribe({
      next: (res: any) => {
        this.allSubcategories = res.subCategories || [];
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error loading subcategories:', error),
    });
  }

  onCategoryChange() {
    if (this.productForm.category) {
      this.filteredSubcategories = this.allSubcategories.filter((sub) => {
        const subCategoryId = typeof sub.category === 'object' ? sub.category?._id : sub.category;
        return subCategoryId === this.productForm.category;
      });
      this.productForm.subcategory = '';
    } else {
      this.filteredSubcategories = [];
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Create image preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  openAddModal() {
    this.resetForm();
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.resetForm();
  }

  openEditModal(product: Product) {
    this.editingProductId = product._id;
    this.productForm = {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category?._id || '',
      subcategory: product.subcategory?._id || '',
      stock: product.stock,
    };
    this.imagePreview = product.image;
    this.onCategoryChange();
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.resetForm();
  }

  resetForm() {
    this.productForm = {
      name: '',
      description: '',
      price: 0,
      category: '',
      subcategory: '',
      stock: 0,
    };
    this.selectedFile = null;
    this.imagePreview = null;
    this.editingProductId = '';
    this.filteredSubcategories = [];
  }

  addProduct() {
    if (!this.validateForm()) return;

    const formData = new FormData();
    formData.append('name', this.productForm.name);
    formData.append('description', this.productForm.description);
    formData.append('price', this.productForm.price.toString());
    formData.append('category', this.productForm.category);
    formData.append('subcategory', this.productForm.subcategory);
    formData.append('stock', this.productForm.stock.toString());

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.productService.addProduct(formData).subscribe({
      next: (res: any) => {
        console.log('Product added:', res);
        alert('Product added successfully!');
        this.closeAddModal();
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error adding product:', error);
        alert('Failed to add product. Please try again.');
      },
    });
  }

  updateProduct() {
    if (!this.validateForm()) return;

    const formData = new FormData();
    formData.append('name', this.productForm.name);
    formData.append('description', this.productForm.description);
    formData.append('price', this.productForm.price.toString());
    formData.append('category', this.productForm.category);
    if (this.productForm.subcategory) {
      formData.append('subcategory', this.productForm.subcategory);
    }
    formData.append('stock', this.productForm.stock.toString());

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
    console.log([...formData.entries()]);
    this.productService.updateProduct(this.editingProductId, formData).subscribe({
      next: (res: any) => {
        console.log('Product updated:', res);
        alert('Product updated successfully!');
        this.closeEditModal();
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error updating product:', error);
        alert('Failed to update product. Please try again.');
      },
    });
  }

  deleteProduct(product: Product) {
    if (
      confirm(`Are you sure you want to delete "${product.name}"? This will mark it as deleted.`)
    ) {
      this.productService.deleteProduct(product._id).subscribe({
        next: (res: any) => {
          console.log('Product deleted:', res);
          alert('Product deleted successfully!');
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          alert('Failed to delete product. Please try again.');
        },
      });
    }
  }

  validateForm(): boolean {
    if (!this.productForm.name || !this.productForm.description) {
      alert('Please fill in all required fields');
      return false;
    }
    if (this.productForm.price <= 0) {
      alert('Price must be greater than 0');
      return false;
    }
    if (!this.productForm.category) {
      alert('Please select a category');
      return false;
    }
    if (!this.showEditModal && !this.selectedFile) {
      alert('Please select an image');
      return false;
    }
    return true;
  }

  onSearch() {
    this.currentPage = 1;
    this.loadProducts();
  }

  onCategoryFilter(categoryId: string) {
    this.selectedCategory = categoryId;
    this.currentPage = 1;
    this.loadProducts();
  }

  getTotalPages(): number {
    return Math.ceil(this.totalProducts / this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  getPageNumbers(): number[] {
    const total = this.getTotalPages();
    const current = this.currentPage;
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1);
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push(-1);
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        pages.push(current - 1);
        pages.push(current);
        pages.push(current + 1);
        pages.push(-1);
        pages.push(total);
      }
    }

    return pages;
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find((cat) => cat._id === categoryId);
    return category ? category.name : 'N/A';
  }
  min(a: number, b: number) {
    return Math.min(a, b);
  }
}
