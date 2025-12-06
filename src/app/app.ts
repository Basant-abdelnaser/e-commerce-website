import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Auth } from './auth/auth/auth';
import { Products } from './userPages/products/products';
import { Testmonials } from './userPages/testmonials/testmonials';
import { Cart } from './userPages/cart/cart';
import { Checkout } from './userPages/checkout/checkout';
import { Orderstatus } from './userPages/orderstatus/orderstatus';
import { ManageCategoriesAndSubcategories } from './admin/manage-categories-and-subcategories/manage-categories-and-subcategories';
import { ManageTestmonials } from './admin/manage-testmonials/manage-testmonials';
import { Users } from './admin/users/users';
import { UserOrders } from './admin/user-orders/user-orders';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Auth,
    // Products,
    // Testmonials,
    // Cart,
    // Checkout,
    // Orderstatus,
    // ManageCategoriesAndSubcategories,
    // ManageTestmonials,
    // Users,
    // UserOrders,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('frontend');
}
