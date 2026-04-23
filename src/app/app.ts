import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (authService.user$ | async; as user) {
      <nav>
        <div class="nav-brand">OW Team Maker</div>
        <div class="nav-links">
          <a routerLink="/players" routerLinkActive="active">Joueurs</a>
          <a routerLink="/teams" routerLinkActive="active">Équipes</a>
          <button (click)="logout()" class="logout-btn">Déconnexion</button>
        </div>
      </nav>
    }
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    nav {
      background-color: #28354f;
      color: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .nav-brand {
      font-size: 1.5rem;
      font-weight: bold;
      color: #f99e1a;
    }
    .nav-links a {
      color: white;
      text-decoration: none;
      margin-right: 1.5rem;
      padding: 0.5rem;
    }
    .nav-links a.active {
      border-bottom: 2px solid #f99e1a;
    }
    .logout-btn {
      background: none;
      border: 1px solid white;
      color: white;
      padding: 0.3rem 0.8rem;
      cursor: pointer;
      border-radius: 4px;
    }
    main {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class AppComponent {
  authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
