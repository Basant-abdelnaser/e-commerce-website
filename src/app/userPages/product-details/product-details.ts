import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ProductService } from '../../services/product-service';
import { CartService } from '../../services/cart-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails {
  product: any = null;
  quantity: number = 1;
  isLoading: boolean = true;
  errorMessage: string = '';
  addingToCart: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Get product slug from route
    this.route.params.subscribe((params) => {
      const slug = params['slug'];
      if (slug) {
        this.loadProduct(slug);
      }
    });
  }

  loadProduct(slug: string) {
    this.isLoading = true;
    this.productService.getProductBySlug(slug).subscribe({
      next: (res: any) => {
        this.product = res.product;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.errorMessage = 'Product not found';
        this.isLoading = false;
      },
    });
  }

  increaseQuantity() {
    if (this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    if (!this.product) return;

    if (this.quantity > this.product.stock) {
      alert('Not enough stock available');
      return;
    }

    this.addingToCart = true;

    this.cartService
      .addToCart({
        product: this.product._id,
        quantity: this.quantity,
      })
      .subscribe({
        next: (res: any) => {
          console.log('Added to cart:', res);
          alert(`Added ${this.quantity} ${this.product.name} to cart!`);
          this.addingToCart = false;
          // Optionally redirect to cart
          // this.router.navigate(['/cart']);
        },
        error: (error) => {
          console.error('Error adding to cart:', error);
          alert('Failed to add to cart. Please try again.');
          this.addingToCart = false;
        },
      });
  }

  buyNow() {
    // Add to cart then redirect to checkout
    this.cartService
      .addToCart({
        product: this.product._id,
        quantity: this.quantity,
      })
      .subscribe({
        next: (res: any) => {
          this.router.navigate(['/checkout']);
        },
        error: (error) => {
          console.error('Error:', error);
          alert('Failed to proceed. Please try again.');
        },
      });
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  getStockStatus(): string {
    if (!this.product) return '';

    if (this.product.stock === 0) {
      return 'Out of Stock';
    } else if (this.product.stock < 10) {
      return `Only ${this.product.stock} left!`;
    } else {
      return 'In Stock';
    }
  }

  getStockClass(): string {
    if (!this.product) return '';

    if (this.product.stock === 0) {
      return 'out-of-stock';
    } else if (this.product.stock < 10) {
      return 'low-stock';
    } else {
      return 'in-stock';
    }
  }

  isOutOfStock(): boolean {
    return this.product && this.product.stock === 0;
  }
}
