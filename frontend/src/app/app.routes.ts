import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ItemsComponent } from './components/items/items.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'items', component: ItemsComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/login' }
];
