import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TrackOrderService } from '../../services/track-order-service';

interface Order {
  _id: string;
  orderNumber: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userAddress: string;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  orderDate: string;
  status: string;
  canUserCancel: boolean;
  refundAllowedTill?: Date;
}

@Component({
  selector: 'app-user-orders',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-orders.html',
  styleUrl: './user-orders.css',
})
export class UserOrders implements OnInit {
  orderStatuses = [
    'pending',
    'prepared',
    'shipped',
    'refused',
    'delivered',
    'canceled',
    'returned',
    'refunded',
  ];

  filterStatus = 'pending';
  orders: Order[] = [];
  isLoading = false;
  errorMessage = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 5;

  constructor(private trackOrderService: TrackOrderService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadAllOrders();
  }

  loadAllOrders() {
    this.isLoading = true;
    this.errorMessage = '';

    this.trackOrderService.getAllOrders().subscribe({
      next: (res: any) => {
        console.log('All orders loaded:', res);

        // Map backend orders to frontend format
        this.orders = (res.orders || []).map((order: any) => {
          const orderDate = new Date(order.createdAt);

          return {
            _id: order._id,
            orderNumber: `ORD-${order._id.slice(-8).toUpperCase()}`,
            userName: order.user?.name || 'Unknown User',
            userEmail: order.user?.email || 'N/A',
            userPhone: order.phone,
            userAddress: this.formatAddress(order.user),
            items: order.products.map((p: any) => ({
              name: p.product?.name || 'Product',
              quantity: p.quantity,
              price: p.price,
            })),
            totalAmount: order.products.reduce(
              (sum: number, p: any) => sum + p.price * p.quantity,
              0
            ),
            orderDate: orderDate.toLocaleDateString('en-US'),
            status: order.status,
            canUserCancel: order.canUserConcel,
            refundAllowedTill: order.refundAllowedTill,
          };
        });

        // Sort by date (newest first)
        this.orders.sort((a, b) => {
          const dateA = new Date(a.orderDate).getTime();
          const dateB = new Date(b.orderDate).getTime();
          return dateB - dateA;
        });

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.errorMessage = 'Failed to load orders. Please try again.';
        this.isLoading = false;
      },
    });
  }

  formatAddress(user: any): string {
    if (!user || !user.addresses || user.addresses.length === 0) {
      return 'Address not available';
    }

    const defaultAddress = user.addresses.find((addr: any) => addr.isDefault) || user.addresses[0];
    return `${defaultAddress.street}, ${defaultAddress.city}, ${defaultAddress.governorate}`;
  }

  getFilteredOrders(): Order[] {
    return this.orders.filter((order) => order.status === this.filterStatus);
  }

  getPaginatedOrders(): Order[] {
    const filtered = this.getFilteredOrders();
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return filtered.slice(start, end);
  }

  getTotalPages(): number {
    return Math.ceil(this.getFilteredOrders().length / this.itemsPerPage);
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
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push(-1); // Ellipsis
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push(-1); // Ellipsis
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1); // Ellipsis
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push(-1); // Ellipsis
        pages.push(total);
      }
    }

    return pages;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  getEndIndex(): number {
    const end = this.currentPage * this.itemsPerPage;
    return Math.min(end, this.getFilteredOrders().length);
  }

  getOrderCountByStatus(status: string): number {
    return this.orders.filter((order) => order.status === status).length;
  }

  changeStatusFilter(status: string) {
    this.filterStatus = status;
    this.currentPage = 1; // Reset to first page when changing filter
  }

  updateOrderStatus(order: Order, newStatus: string) {
    const oldStatus = order.status;

    // Optimistic update
    order.status = newStatus;

    this.trackOrderService.updateOrderStatus(order._id, { status: newStatus }).subscribe({
      next: (res: any) => {
        console.log(`Order #${order.orderNumber} status updated to: ${newStatus}`);

        // Update canUserCancel based on new status
        if (res.order) {
          order.canUserCancel = res.order.canUserConcel;
          order.refundAllowedTill = res.order.refundAllowedTill;
        }

        // If status changed, the order might not be in current filter
        if (newStatus !== this.filterStatus) {
          // Refresh the view
          const currentPageOrders = this.getPaginatedOrders();
          if (currentPageOrders.length === 0 && this.currentPage > 1) {
            this.currentPage--;
          }
        }
      },
      error: (err) => {
        console.error('Error updating order status:', err);
        // Revert on error
        order.status = oldStatus;
        alert('Failed to update order status. Please try again.');
      },
    });
  }

  refreshOrders() {
    this.loadAllOrders();
  }

  deleteOrder(orderId: string) {
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      this.trackOrderService.deleteOrder(orderId).subscribe({
        next: (res: any) => {
          console.log('Order deleted:', res);
          this.orders = this.orders.filter((order) => order._id !== orderId);

          // Adjust pagination if needed
          const currentPageOrders = this.getPaginatedOrders();
          if (currentPageOrders.length === 0 && this.currentPage > 1) {
            this.currentPage--;
          }
        },
        error: (err) => {
          console.error('Error deleting order:', err);
          alert('Failed to delete order. Please try again.');
        },
      });
    }
  }
}
