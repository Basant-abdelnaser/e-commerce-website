import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TestmonialService } from '../../services/testmonial-service';

@Component({
  selector: 'app-testmonials',
  imports: [CommonModule, FormsModule],
  templateUrl: './testmonials.html',
  styleUrl: './testmonials.css',
})
export class Testmonials implements OnInit {
  testimonials: any[] = [];
  showTestimonialForm = false;
  newTestimonial = {
    rating: 5,
    message: '',
  };
  constructor(private testmonialService: TestmonialService, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void {
    this.loadTestimonials();
  }
  loadTestimonials() {
    this.testmonialService.getAllTestmonials().subscribe({
      next: (res: any) => {
        this.testimonials = res.testmonials;
        console.log('Testimonials loaded:', this.testimonials);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading testimonials:', error);
      },
    });
  }
  openTestimonialForm() {
    this.showTestimonialForm = true;
  }

  closeTestimonialForm() {
    this.showTestimonialForm = false;
    this.newTestimonial = { rating: 5, message: '' };
  }

  submitTestimonial() {
    if (this.newTestimonial.rating && this.newTestimonial.message) {
      console.log('Testimonial submitted:', this.newTestimonial);
      this.testmonialService.addNewTestmonial(this.newTestimonial).subscribe({
        next: (res: any) => {
          console.log('Testimonial added:', res);
          this.loadTestimonials();
          this.closeTestimonialForm(); // <-- هنا
        },
        error: (error) => {
          console.error('Error adding testimonial:', error);
        },
      });
    }
  }

  getStars(rating: number): string[] {
    return Array(5)
      .fill('')
      .map((_, i) => (i < rating ? '★' : '☆'));
  }
}
