import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TestmonialService } from '../../services/testmonial-service';

@Component({
  selector: 'app-manage-testmonials',
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-testmonials.html',
  styleUrl: './manage-testmonials.css',
})
export class ManageTestmonials implements OnInit {
  activeTab: 'pending' | 'approved' = 'pending';
  testimonials: any[] = [];

  constructor(private testmonialService: TestmonialService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadTestimonials();
  }

  loadTestimonials() {
    this.testmonialService.getAllTestmonialsForAdmin().subscribe({
      next: (res: any) => {
        this.testimonials = res.testmonials;
        console.log('Testimonials loaded:', this.testimonials);

        // ⭐ حل المشكلة — تحديث الواجهة فورًا
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading testimonials:', error);
      },
    });
  }

  getFilteredTestimonials(): any[] {
    return this.testimonials.filter((t) =>
      this.activeTab === 'pending' ? t.newFlag === true : t.newFlag === false
    );
  }

  getPendingCount(): number {
    return this.testimonials.filter((t) => t.newFlag === true).length;
  }

  getApprovedCount(): number {
    return this.testimonials.filter((t) => t.newFlag === false).length;
  }

  approveTestimonial(id: string) {
    this.testmonialService
      .updateTestmonial(id, { newFlag: false, visibleToClient: true })
      .subscribe({
        next: (res: any) => {
          console.log('Testimonial updated:', res);

          this.testimonials = this.testimonials.map((t) =>
            t._id === id ? { ...t, newFlag: false } : t
          );

          this.cdr.detectChanges(); // ⭐ برضو مهمة هنا
        },
        error: (error) => {
          console.error('Error updating testimonial:', error);
        },
      });
  }

  rejectTestimonial(id: string) {
    this.testimonials = this.testimonials.filter((t) => t._id !== id);
    console.log('Rejected/Removed testimonial:', id);

    this.cdr.detectChanges(); // ⭐ تحديث الواجهة فورًا

    this.testmonialService.delteTestmonial(id).subscribe({
      next: (res: any) => {
        console.log('Testimonial deleted:', res);
      },
      error: (error) => {
        console.error('Error deleting testimonial:', error);
      },
    });
  }
}
