import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GetUserInfoService } from '../../services/get-user-info-service';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  blocked: boolean;
  joinDate: string;
  addresses: any[];
}

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm = '';
  filterStatus = 'all';
  isLoading = false;
  errorMessage = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;

  constructor(private userInfoService: GetUserInfoService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadAllUsers();
  }

  loadAllUsers() {
    this.isLoading = true;
    this.errorMessage = '';

    this.userInfoService.getAllUsers().subscribe({
      next: (res: any) => {
        console.log('All users loaded:', res);

        // Map backend users to frontend format
        this.users = (res.users || []).map((user: any) => ({
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isAdmin: user.isAdmin || false,
          blocked: user.blocked || false,
          joinDate: new Date(user.createdAt).toLocaleDateString('en-US'),
          addresses: user.addresses || [],
        }));

        // Sort by join date (newest first)
        this.users.sort((a, b) => {
          const dateA = new Date(a.joinDate).getTime();
          const dateB = new Date(b.joinDate).getTime();
          return dateB - dateA;
        });

        this.filteredUsers = [...this.users];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.errorMessage = 'Failed to load users. Please try again.';
        this.isLoading = false;
      },
    });
  }

  getActiveUsers(): number {
    return this.users.filter((u) => !u.blocked).length;
  }

  getBlockedUsers(): number {
    return this.users.filter((u) => u.blocked).length;
  }

  getAdminUsers(): number {
    return this.users.filter((u) => u.isAdmin).length;
  }

  onSearch() {
    this.filteredUsers = this.users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.phone.includes(this.searchTerm);

      const matchesFilter =
        this.filterStatus === 'all' ||
        (this.filterStatus === 'active' && !user.blocked) ||
        (this.filterStatus === 'blocked' && user.blocked) ||
        (this.filterStatus === 'admin' && user.isAdmin);

      return matchesSearch && matchesFilter;
    });

    this.currentPage = 1;
  }

  getFilteredUsers(): User[] {
    return this.filteredUsers;
  }

  getPaginatedUsers(): User[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredUsers.slice(start, end);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
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
    return Math.min(end, this.filteredUsers.length);
  }

  blockUser(user: User) {
    if (user.isAdmin) {
      alert('Cannot block admin users');
      return;
    }

    if (confirm(`Are you sure you want to block ${user.name}?`)) {
      const originalBlockedState = user.blocked;

      // Optimistic update
      user.blocked = true;

      this.userInfoService.updateUser(user._id, { blocked: true }).subscribe({
        next: (res: any) => {
          console.log('User blocked:', res);
          this.onSearch(); // Refresh filtered list
        },
        error: (err) => {
          console.error('Error blocking user:', err);
          // Revert on error
          user.blocked = originalBlockedState;
          alert('Failed to block user. Please try again.');
        },
      });
    }
  }

  unblockUser(user: User) {
    if (confirm(`Are you sure you want to unblock ${user.name}?`)) {
      const originalBlockedState = user.blocked;

      // Optimistic update
      user.blocked = false;

      this.userInfoService.updateUser(user._id, { blocked: false }).subscribe({
        next: (res: any) => {
          console.log('User unblocked:', res);
          this.onSearch(); // Refresh filtered list
        },
        error: (err) => {
          console.error('Error unblocking user:', err);
          // Revert on error
          user.blocked = originalBlockedState;
          alert('Failed to unblock user. Please try again.');
        },
      });
    }
  }

  refreshUsers() {
    this.loadAllUsers();
  }

  deleteUser(user: User) {
    if (user.isAdmin) {
      alert('Cannot delete admin users');
      return;
    }

    if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      this.userInfoService.deleteUser(user._id).subscribe({
        next: (res: any) => {
          console.log('User deleted:', res);
          this.users = this.users.filter((u) => u._id !== user._id);
          this.onSearch();
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          alert('Failed to delete user. Please try again.');
        },
      });
    }
  }
}
