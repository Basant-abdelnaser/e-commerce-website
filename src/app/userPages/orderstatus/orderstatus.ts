import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TrackOrderService } from '../../services/track-order-service';

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  date: string;
  status:
    | 'pending'
    | 'prepared'
    | 'shipped'
    | 'refused'
    | 'delivered'
    | 'canceled'
    | 'returned'
    | 'refunded';
  items: OrderItem[];
  total: number;
  shippingAddress: string;
  estimatedDelivery: string;
  trackingNumber?: string;
  phone: string;
  canUserCancel: boolean;
  refundAllowedTill?: Date;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-orderstatus',
  imports: [CommonModule, FormsModule],
  templateUrl: './orderstatus.html',
  styleUrl: './orderstatus.css',
})
export class Orderstatus implements OnInit {
  orders: Order[] = [];
  selectedOrder: Order | null = null;
  showCancelModal = false;
  cancelReason = '';
  isLoading = false;
  errorMessage = '';

  constructor(private trackOrderService: TrackOrderService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadUserOrders();
  }

  // Load user orders from backend
  loadUserOrders() {
    this.isLoading = true;
    this.errorMessage = '';

    this.trackOrderService.getUserOrders().subscribe({
      next: (res: any) => {
        console.log('Orders loaded:', res);

        // Map backend orders to frontend format
        this.orders = (res.orders || []).map((order: any) => {
          // Calculate estimated delivery (7 days from order date if not delivered)
          const orderDate = new Date(order.createdAt);
          const estimatedDelivery = new Date(orderDate);
          estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

          return {
            _id: order._id,
            orderNumber: `ORD-${order._id.slice(-8).toUpperCase()}`,
            date: new Date(order.createdAt).toLocaleDateString('en-US'),
            status: order.status,
            items: order.products.map((p: any) => ({
              _id: p.product._id,
              name: p.product.name || 'Product',
              price: p.price,
              quantity: p.quantity,
              image: p.product.image || '📦',
            })),
            total: order.products.reduce((sum: number, p: any) => sum + p.price * p.quantity, 0),
            shippingAddress: this.formatAddress(order.user),
            estimatedDelivery: estimatedDelivery.toLocaleDateString('en-US'),
            trackingNumber: order.trackingNumber,
            phone: order.phone,
            canUserCancel: order.canUserConcel,
            refundAllowedTill: order.refundAllowedTill,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
          };
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

  // Format address from user data
  formatAddress(user: any): string {
    if (!user || !user.addresses || user.addresses.length === 0) {
      return 'Address not available';
    }

    const defaultAddress = user.addresses.find((addr: any) => addr.isDefault) || user.addresses[0];
    return `${defaultAddress.street}, ${defaultAddress.city}, ${defaultAddress.governorate}`;
  }

  // Get status color and icon
  getStatusInfo(status: string) {
    const statusMap: any = {
      pending: { color: '#f59e0b', icon: '⏳', label: 'Pending' },
      prepared: { color: '#3b82f6', icon: '📦', label: 'Prepared' },
      shipped: { color: '#8b5cf6', icon: '🚚', label: 'Shipped' },
      refused: { color: '#ef4444', icon: '🚫', label: 'Refused' },
      delivered: { color: '#10b981', icon: '✅', label: 'Delivered' },
      canceled: { color: '#6b7280', icon: '❌', label: 'Canceled' },
      returned: { color: '#f97316', icon: '↩️', label: 'Returned' },
      refunded: { color: '#06b6d4', icon: '💰', label: 'Refunded' },
    };
    return statusMap[status] || statusMap.pending;
  }

  // Check if order can be canceled
  canCancelOrder(order: Order): boolean {
    // Use the canUserCancel flag from backend
    return order.canUserCancel && (order.status === 'pending' || order.status === 'prepared');
  }

  // Get progress percentage based on status
  getProgressPercentage(status: string): number {
    const progressMap: any = {
      pending: 25,
      prepared: 50,
      shipped: 75,
      delivered: 100,
      refused: 0,
      canceled: 0,
      returned: 0,
      refunded: 0,
    };
    return progressMap[status] || 0;
  }

  // Get timeline steps
  getTimelineSteps(status: string) {
    const baseSteps = [
      { label: 'Order Placed', status: 'pending', icon: '🛍️' },
      { label: 'Being Prepared', status: 'prepared', icon: '📦' },
      { label: 'Shipped', status: 'shipped', icon: '🚚' },
      { label: 'Delivered', status: 'delivered', icon: '✅' },
    ];

    const statusIndex: any = {
      pending: 0,
      prepared: 1,
      shipped: 2,
      delivered: 3,
      refused: -1,
      canceled: -1,
      returned: -1,
      refunded: -1,
    };

    const currentIndex = statusIndex[status];

    return baseSteps.map((step, index) => ({
      ...step,
      isActive: index === currentIndex,
      isCompleted: index < currentIndex,
      isUpcoming: index > currentIndex,
    }));
  }

  // View order details
  viewOrderDetails(order: Order) {
    this.selectedOrder = order;
  }

  // Close order details
  closeOrderDetails() {
    this.selectedOrder = null;
  }

  // Open cancel modal
  openCancelModal(order: Order) {
    if (this.canCancelOrder(order)) {
      this.selectedOrder = order;
      this.showCancelModal = true;
      this.cancelReason = '';
    }
  }

  // Close cancel modal
  closeCancelModal() {
    this.showCancelModal = false;
    this.cancelReason = '';
    this.selectedOrder = null;
  }

  // Confirm cancel order
  confirmCancelOrder() {
    if (this.selectedOrder) {
      const orderId = this.selectedOrder._id;

      this.trackOrderService
        .updateOrderStatus(orderId, {
          status: 'canceled',
          cancelReason: this.cancelReason,
        })
        .subscribe({
          next: (res: any) => {
            console.log('Order canceled:', res);

            // Update the order in the local array
            const orderIndex = this.orders.findIndex((o) => o._id === orderId);
            if (orderIndex !== -1) {
              this.orders[orderIndex].status = 'canceled';
              this.orders[orderIndex].canUserCancel = false;
            }

            alert(
              `Order ${this.selectedOrder!.orderNumber} has been canceled
              }`
            );
            this.closeCancelModal();
            this.closeOrderDetails();
          },
          error: (err) => {
            console.error('Error canceling order:', err);
            alert('Failed to cancel order. Please try again.');
          },
        });
    } else {
      alert('Please provide a reason for cancellation');
    }
  }

  // Track order (open tracking link)
  trackOrder(trackingNumber: string) {
    alert(
      `Tracking Number: ${trackingNumber}\n\nIn a real application, this would open the carrier's tracking page.`
    );
  }

  // Reorder
  reorder(order: Order) {
    alert(`Items from order ${order.orderNumber} have been added to your cart!`);
    // TODO: Implement actual reorder functionality
    // Add order items back to cart
  }

  // Contact support
  contactSupport(order: Order) {
    alert(`Opening support chat for order ${order.orderNumber}...`);
    // TODO: Implement actual support contact functionality
  }

  // Refresh orders
  refreshOrders() {
    this.loadUserOrders();
  }
}
