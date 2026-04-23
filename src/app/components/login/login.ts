import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  async login() {
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/players']);
    } catch (error) {
      console.error('Login failed', error);
    }
  }
}
