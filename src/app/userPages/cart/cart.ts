import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  cartItems: any[] = [];

  constructor(
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCartItems();
  }

  loadCartItems() {
    this.cartService.getCartItems().subscribe({
      next: (res: any) => {
        this.cartItems = res.cartItems || [];
        console.log('Cart items loaded:', this.cartItems);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading cart items:', err),
    });
  }

  // ===================== CALCULATIONS =====================

  getItemSubtotal(item: any): number {
    return item.product.price * item.quantity;
  }

  getCartTotal(): number {
    return this.cartItems.reduce((sum, item) => {
      return sum + this.getItemSubtotal(item);
    }, 0);
  }

  getTotalItems(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  getTax(): number {
    return this.getCartTotal() * 0.1;
  }

  getShipping(): number {
    return this.getCartTotal() >= 200 ? 0 : 10;
  }

  getFinalTotal(): number {
    return this.getCartTotal() + this.getTax() + this.getShipping();
  }

  // ===================== QUANTITY UPDATES =====================

  increaseQuantity(item: any) {
    item.quantity++;
    this.cartService
      .updateCartItem(item._id, {
        product: item.product._id,
        quantity: item.quantity,
      })
      .subscribe({
        error: (err) => console.error('Update error:', err),
      });
  }

  decreaseQuantity(item: any) {
    if (item.quantity <= 1) return;
    item.quantity--;
    this.cartService
      .updateCartItem(item._id, {
        product: item.product._id,
        quantity: item.quantity,
      })
      .subscribe({
        error: (err) => console.error('Update error:', err),
      });
  }

  updateQuantity(item: any, event: any) {
    let q = parseInt(event.target.value);
    if (isNaN(q) || q < 1) q = 1;
    item.quantity = q;
    this.cartService
      .updateCartItem(item._id, { product: item.product._id, quantity: item.quantity })
      .subscribe({
        error: (err) => console.error('Update error:', err),
      });
  }

  // ===================== REMOVE & CLEAR =====================

  removeItem(item: any) {
    if (!confirm('Remove item?')) return;
    this.cartService.deleteCartItem(item._id).subscribe({
      next: () => {
        // this.cartItems = this.cartItems.filter((i) => i._id !== item._id);
        this.loadCartItems();
      },
      error: (err) => console.error('Delete error:', err),
    });
  }

  clearCart() {
    if (!confirm('Clear cart?')) return;

    this.cartService.clearCart().subscribe({
      next: () => {
        this.loadCartItems();
      },
      error: (err) => console.error('Clear error:', err),
    });
  }

  checkout() {
    this.router.navigate(['/checkout']);
  }
  goHome() {
    this.router.navigate(['/home']);
  }
}
