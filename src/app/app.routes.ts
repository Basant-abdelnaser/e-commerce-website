import { Routes } from '@angular/router';
import { Products } from './userPages/products/products';
import { ManageCategoriesAndSubcategories } from './admin/manage-categories-and-subcategories/manage-categories-and-subcategories';
import { Auth } from './auth/auth/auth';
import { Cart } from './userPages/cart/cart';
import { Checkout } from './userPages/checkout/checkout';
import { Orderstatus } from './userPages/orderstatus/orderstatus';
import { ManageTestmonials } from './admin/manage-testmonials/manage-testmonials';
import { UserOrders } from './admin/user-orders/user-orders';
import { Users } from './admin/users/users';
import { Admin } from './admin/admin/admin';
import { ManageProducts } from './admin/manage-products/manage-products';
import { ProductDetails } from './userPages/product-details/product-details';
import { AdminGuard } from './guards/admin-guard';
import { cartGuard } from './guards/cart-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Auth },
  { path: 'home', component: Products },
  { path: 'cart', component: Cart },
  { path: 'checkout', component: Checkout },
  { path: 'trackOrder', component: Orderstatus },
  { path: 'product/:slug', component: ProductDetails },
  {
    path: 'admin',
    component: Admin,
    // canActivate: [AdminGuard],
    children: [
      { path: 'manage-categories', component: ManageCategoriesAndSubcategories },
      { path: 'manage-testmonials', component: ManageTestmonials },
      { path: 'user-orders', component: UserOrders },
      { path: 'users', component: Users },
      { path: 'manage-products', component: ManageProducts },
    ],
  },

  // { path: '**', redirectTo: 'home' },
];
