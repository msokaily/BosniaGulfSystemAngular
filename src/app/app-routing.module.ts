import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    data: { name: 'login' },
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'home',
    data: { name: 'home' },
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'logout',
    data: { name: 'logout' },
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'cars',
    data: { name: 'cars' },
    loadChildren: () => import('./cars/cars.module').then( m => m.CarsPageModule)
  },
  {
    path: 'filter',
    loadChildren: () => import('./filter/filter.module').then( m => m.FilterPageModule)
  },
  {
    path: 'edit-page',
    loadChildren: () => import('./edit-page/edit-page.module').then( m => m.EditPagePageModule)
  },
  {
    path: 'users',
    loadChildren: () => import('./users/users.module').then( m => m.UsersPageModule)
  },
  {
    path: 'partners',
    loadChildren: () => import('./partners/partners.module').then( m => m.PartnersPageModule)
  },
  // Not Found ===========================================
  {
    path: '**',
    data: { name: 'page404' },
    loadChildren: () => import('./page404/page404.module').then( m => m.Page404PageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
