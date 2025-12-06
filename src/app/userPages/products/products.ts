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

    // Add category filter if selected
    if (this.selectedCategory !== 'all') {
      params.category = this.selectedCategory;
    }

    // Add subcategory filter if selected
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
        console.log('Total pages:', this.totalPages);
        console.log('Current page:', this.page);
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
        console.log('Categories loaded:', this.categories);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      },
    });
  }

  loadAllSubcategories() {
    this.subcategoryService.getSubcategories().subscribe({
      next: (res: any) => {
        this.allSubcategories = res.subCategories || [];
        this.subcategories = []; // Start with empty, will populate when category is selected
        console.log('All Subcategories loaded:', this.allSubcategories);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading subcategories:', error);
      },
    });
  }

  selectCategory(categoryId: string) {
    this.selectedCategory = categoryId;
    this.selectedSubcategory = 'all'; // Reset subcategory
    this.page = 1; // Reset to first page

    // Filter and show subcategories based on selected category
    if (categoryId === 'all') {
      this.subcategories = []; // Hide subcategories when "All" is selected
    } else {
      // Filter subcategories that belong to the selected category
      this.subcategories = this.allSubcategories.filter((sub) => {
        // Check if sub.category is an object or string ID
        const subCategoryId = typeof sub.category === 'object' ? sub.category?._id : sub.category;
        return subCategoryId === categoryId;
      });

      console.log('Filtered subcategories for category', categoryId, ':', this.subcategories);
    }

    this.loadProducts();
  }

  selectSubcategory(subcategoryId: string) {
    this.selectedSubcategory = subcategoryId;
    this.page = 1;

    console.log('Subcategory selected:', subcategoryId);

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
    const maxVisible = 5; // Maximum number of page buttons to show

    if (this.totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination
      if (this.page <= 3) {
        // Near the beginning
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(-1); // Ellipsis
        pages.push(this.totalPages);
      } else if (this.page >= this.totalPages - 2) {
        // Near the end
        pages.push(1);
        pages.push(-1); // Ellipsis
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push(1);
        pages.push(-1); // Ellipsis
        pages.push(this.page - 1);
        pages.push(this.page);
        pages.push(this.page + 1);
        pages.push(-1); // Ellipsis
        pages.push(this.totalPages);
      }
    }

    return pages;
  }

  addToCart(product: any) {
    this.cartService.addToCart({ product: product._id, quantity: 1 }).subscribe({
      next: (res: any) => {
        console.log('Added to cart:', product.name);
        console.log('Product added to cart:', res);
      },
      error: (error) => {
        console.error('Error adding product to cart:', error);
      },
    });
  }
  getCartCount() {
    this.cartService.getCartItems().subscribe({
      next: (res: any) => {
        this.cartCount = res.length;
        console.log('Cart count:', res.cartItems.length);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error getting cart count:', error);
      },
    });
  }
  // getCount() {
  //   console.log('====================================');
  //   console.log(this.cartCount, 'my cart cunt');
  //   console.log('====================================');
  //   return this.cartCount;
  // }

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
