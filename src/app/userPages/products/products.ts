import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product-service';
import { CategoriesService } from '../../services/categories-service';
import { SubcategoriesService } from '../../services/subcategories-service';
import { log } from 'console';
import { CartService } from '../../services/cart-service';
import { Testmonials } from '../testmonials/testmonials';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule, Testmonials],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  subcategories: any[] = [];
  allSubcategories: any[] = [];

  selectedCategory: string = 'all';
  selectedSubcategory: string = 'all';

  cartCount: number = 0;

  // PAGINATION
  page: number = 1;
  limit: number = 8;
  totalPages: number = 1;
  totalProducts: number = 0;

  constructor(
    private router: Router,
    private productService: ProductService,
    private categoryService: CategoriesService,
    private subcategoryService: SubcategoriesService,
    private cdr: ChangeDetectorRef,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadAllSubcategories();
    this.loadProducts();
    this.getCartCount();
  }

  loadProducts() {
    const params: any = {
      page: this.page,
      limit: this.limit,
    };

    if (this.selectedCategory !== 'all') {
      params.category = this.selectedCategory;
    }

    if (this.selectedSubcategory !== 'all') {
      params.subcategory = this.selectedSubcategory;
    }

    console.log('Loading products with params:', params);

    this.productService.getProducts(params).subscribe({
      next: (res: any) => {
        this.products = res.data || [];
        this.totalPages = res.totalPages || 1;
        this.totalProducts = res.results || 0;
        console.log('Products loaded:', this.products);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.products = [];
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
        this.subcategories = [];
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error loading subcategories:', error),
    });
  }

  selectCategory(categoryId: string) {
    this.selectedCategory = categoryId;
    this.selectedSubcategory = 'all';
    this.page = 1;

    if (categoryId === 'all') {
      this.subcategories = [];
    } else {
      this.subcategories = this.allSubcategories.filter((sub) => {
        const subCategoryId = typeof sub.category === 'object' ? sub.category?._id : sub.category;
        return subCategoryId === categoryId;
      });
    }

    this.loadProducts();
  }

  selectSubcategory(subcategoryId: string) {
    this.selectedSubcategory = subcategoryId;
    this.page = 1;
    this.loadProducts();
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToPage(pageNumber: number) {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.page = pageNumber;
      this.loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;

    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(this.totalPages);
      } else if (this.page >= this.totalPages - 2) {
        pages.push(1);
        pages.push(-1);
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1);
        pages.push(this.page - 1);
        pages.push(this.page);
        pages.push(this.page + 1);
        pages.push(-1);
        pages.push(this.totalPages);
      }
    }

    return pages;
  }

  // Navigate to product details page
  viewProductDetails(product: any) {
    // Use slug for SEO-friendly URLs
    this.router.navigate(['/product', product.slug]);
  }

  getCartCount() {
    this.cartService.getCartItems().subscribe({
      next: (res: any) => {
        this.cartCount = res.products?.length || 0;
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error getting cart count:', error),
    });
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find((cat) => cat._id === categoryId);
    return category ? category.name : '';
  }

  getSubcategoryName(subcategoryId: string): string {
    const subcategory = this.allSubcategories.find((sub) => sub._id === subcategoryId);
    return subcategory ? subcategory.name : '';
  }

  goToOrders() {
    this.router.navigate(['/trackOrder']);
  }
}
