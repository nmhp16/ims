import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  isLogin = true;
  username = '';
  password = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleForm(): void {
    this.isLogin = !this.isLogin;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Username and password are required';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.isLogin) {
      this.login();
    } else {
      this.register();
    }
  }

  private login(): void {
    this.authService.login(this.username, this.password)
      .subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.router.navigate(['/items']);
        },
        error: (error) => {
          console.error('Login error:', error);
          this.errorMessage = error.error?.message || error || 'Invalid credentials!';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  private register(): void {
    this.authService.register(this.username, this.password)
      .subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          this.successMessage = response.message || 'Registration successful!';
          this.errorMessage = '';
          this.isLogin = true;
          this.username = '';
          this.password = '';
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.errorMessage = error.error?.message || error || 'Registration failed!';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }
}
