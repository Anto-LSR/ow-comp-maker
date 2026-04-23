import { Routes } from '@angular/router';
import { PlayerListComponent } from './components/player-list/player-list';
import { PlayerFormComponent } from './components/player-form/player-form';
import { TeamViewComponent } from './components/team-view/team-view';
import { LoginComponent } from './components/login/login';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'players', component: PlayerListComponent, canActivate: [authGuard] },
  { path: 'players/add', component: PlayerFormComponent, canActivate: [authGuard] },
  { path: 'players/edit/:id', component: PlayerFormComponent, canActivate: [authGuard] },
  { path: 'teams', component: TeamViewComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/players', pathMatch: 'full' },
];
