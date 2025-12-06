import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GetUserInfoService } from '../../services/get-user-info-service';
import { CartService } from '../../services/cart-service';
import { Router } from '@angular/router';
import { TrackOrderService } from '../../services/track-order-service';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  currentStep: number = 1;
  cartItems: any[] = [];
  userId: string = '';
  isLoadingUser: boolean = false;
  isLoadingCart: boolean = false;

  checkoutForm: any = {
    name: '',
    email: '',
    phone: '',
    address: {
      governorate: '',
      city: '',
      street: '',
      isDefault: true,
    },
    saveInfo: false,
  };

  originalUserData: any = null;

  constructor(
    private userInfoService: GetUserInfoService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private trackOrderService: TrackOrderService
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    this.loadCartItems();
  }

  loadUserInfo() {
    this.isLoadingUser = true;
    this.userInfoService.getUser().subscribe({
      next: (res: any) => {
        console.log('User data loaded:', res);
        this.userId = res.user._id;
        this.originalUserData = { ...res };

        // Populate form with user data
        this.checkoutForm.name = res.user.name || '';

        this.checkoutForm.email = res.user.email || '';
        this.checkoutForm.phone = res.user.phone || '';

        // Find default address or use first address
        const defaultAddress =
          res.user.addresses?.find((addr: any) => addr.isDefault) || res.addresses?.[0];

        if (defaultAddress) {
          this.checkoutForm.address = {
            governorate: defaultAddress.governorate || '',
            city: defaultAddress.city || '',
            street: defaultAddress.street || '',
            isDefault: defaultAddress.isDefault || true,
          };
        }
        console.log('Checkout form data:', this.checkoutForm);
        this.isLoadingUser = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading user info:', err);
        this.isLoadingUser = false;
        alert('Failed to load user information. Please try again.');
      },
    });
  }

  loadCartItems() {
    this.isLoadingCart = true;
    this.cartService.getCartItems().subscribe({
      next: (res: any) => {
        console.log('Cart response:', res);
        // Handle different response structures
        this.cartItems = res.products || res.cartItems || res.cart?.products || [];

        // Map the cart items to include product details
        this.cartItems = this.cartItems.map((item: any) => ({
          _id: item.product?._id || item._id,
          name: item.product?.name || item.name || 'Product',
          price: item.product?.price || item.price || 0,
          quantity: item.quantity || 1,
          image: item.product?.image || item.image || '',
        }));

        console.log('Processed cart items:', this.cartItems);
        this.isLoadingCart = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading cart items:', err);
        this.isLoadingCart = false;
        alert('Failed to load cart items. Please try again.');
      },
    });
  }

  // Remove item from cart
  removeIFromCart() {
    this.cartService.clearCart().subscribe({
      next: () => {
        console.log('Cart cleared successfully');
      },
      error: (err) => {
        console.error('Error clearing cart:', err);
        alert('Failed to clear cart. Please try again.');
      },
    });
  }

  // Calculate totals
  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  getTax(): number {
    return this.getSubtotal() * 0.1;
  }

  getShippingCost(): number {
    return 50;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getTax() + this.getShippingCost();
  }

  // Navigation
  nextStep() {
    if (this.validateCurrentStep()) {
      if (this.currentStep < 3) {
        this.currentStep++;
      }
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number) {
    if (step <= this.currentStep) {
      this.currentStep = step;
    }
  }

  // Validation
  validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.validatePersonalInfo();
      case 2:
        return this.validateShippingInfo();
      default:
        return true;
    }
  }

  validatePersonalInfo(): boolean {
    const { name, email, phone } = this.checkoutForm;
    if (!name || !email || !phone) {
      alert('Please fill in all personal information fields');
      return false;
    }
    if (!this.isValidEmail(email)) {
      alert('Please enter a valid email address');
      return false;
    }
    return true;
  }

  validateShippingInfo(): boolean {
    const { governorate, city, street } = this.checkoutForm.address;
    if (!governorate || !city || !street) {
      alert('Please fill in all shipping address fields');
      return false;
    }
    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Check if user data has changed
  hasUserDataChanged(): boolean {
    if (!this.originalUserData) return false;

    const nameChanged = this.checkoutForm.name !== this.originalUserData.name;
    const phoneChanged = this.checkoutForm.phone !== this.originalUserData.phone;

    const defaultAddress =
      this.originalUserData.addresses?.find((addr: any) => addr.isDefault) ||
      this.originalUserData.addresses?.[0];

    const addressChanged =
      defaultAddress &&
      (this.checkoutForm.address.governorate !== defaultAddress.governorate ||
        this.checkoutForm.address.city !== defaultAddress.city ||
        this.checkoutForm.address.street !== defaultAddress.street);

    return nameChanged || phoneChanged || addressChanged;
  }

  // Save user info updates
  saveUserInfo() {
    if (!this.userId) {
      alert('User ID not found');
      return;
    }

    const updateData: any = {
      name: this.checkoutForm.name,
      phone: this.checkoutForm.phone,
    };

    // Update or add address
    if (this.checkoutForm.saveInfo) {
      const addressExists = this.originalUserData.addresses?.some(
        (addr: any) =>
          addr.governorate === this.checkoutForm.address.governorate &&
          addr.city === this.checkoutForm.address.city &&
          addr.street === this.checkoutForm.address.street
      );

      if (!addressExists) {
        // Add new address or update existing default
        const updatedAddresses =
          this.originalUserData.addresses?.map((addr: any) => ({
            ...addr,
            isDefault: false,
          })) || [];

        updatedAddresses.push({
          governorate: this.checkoutForm.address.governorate,
          city: this.checkoutForm.address.city,
          street: this.checkoutForm.address.street,
          isDefault: true,
        });

        updateData.addresses = updatedAddresses;
      }
    }

    this.userInfoService.updateUser(this.userId, updateData).subscribe({
      next: (res: any) => {
        console.log('User info updated:', res);
        this.originalUserData = { ...res };
        alert('Your information has been saved successfully!');
      },
      error: (err) => {
        console.error('Error updating user info:', err);
        alert('Failed to save your information. Please try again.');
      },
    });
  }
  createOrder() {
    if (!this.userId || this.cartItems.length === 0) {
      alert('Cannot create order: Missing user ID or empty cart');
      return;
    }
    // Prepare order data according to schema
    const orderData = {
      user: this.userId,
      phone: this.checkoutForm.phone,
      products: this.cartItems.map((item) => ({
        product: item._id,
        quantity: item.quantity,
        price: item.price,
      })),
      status: 'pending',
      canUserConcel: true,
    };

    console.log('Creating order with data:', orderData);

    this.trackOrderService.addNewOrder(orderData).subscribe({
      next: (res: any) => {
        console.log('Order created successfully:', res);
        alert(
          `Order completed successfully!\n\nTotal: ${this.getTotal().toFixed(
            2
          )}\n\nThank you for your purchase, ${this.checkoutForm.name}!`
        );

        // Navigate to track order page
        this.router.navigate(['/trackOrder']);
        this.removeIFromCart();
      },
      error: (err) => {
        console.error('Error creating order:', err);
        alert('Failed to create order. Please try again.');
      },
    });
  }
  // Complete order
  completeOrder() {
    this.createOrder();
    console.log('====================================');
    console.log('is calleddd');
    console.log('====================================');
    this.saveUserInfo();
    alert(
      `Order completed successfully!\n\nTotal: $${this.getTotal().toFixed(
        2
      )}\n\nThank you for your purchase, ${this.checkoutForm.name}!`
    );

    this.router.navigate(['/trackOrder']);
  }
}
