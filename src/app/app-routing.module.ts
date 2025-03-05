import { CanOpenRoute } from './guards/CanOpenRoute.guard';
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
    canActivate: [CanOpenRoute],
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
    canActivate: [CanOpenRoute],
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
    data: { name: 'users' },
    canActivate: [CanOpenRoute],
    loadChildren: () => import('./users/users.module').then( m => m.UsersPageModule)
  },
  {
    path: 'partners',
    data: { name: 'partners' },
    canActivate: [CanOpenRoute],
    loadChildren: () => import('./partners/partners.module').then( m => m.PartnersPageModule)
  },
  {
    path: 'car-companies',
    data: { name: 'car-companies' },
    canActivate: [CanOpenRoute],
    loadChildren: () => import('./car-companies/car-companies.module').then( m => m.CarCompaniesPageModule)
  },
  {
    path: 'drivers',
    data: { name: 'drivers' },
    canActivate: [CanOpenRoute],
    loadChildren: () => import('./drivers/drivers.module').then( m => m.DriversPageModule)
  },
  {
    path: 'accommodations',
    data: { name: 'accommodations' },
    canActivate: [CanOpenRoute],
    loadChildren: () => import('./accommodations/accommodations.module').then( m => m.AccommodationsPageModule)
  },
  {
    path: 'orders',
    data: { name: 'orders' },
    canActivate: [CanOpenRoute],
    loadChildren: () => import('./orders/orders.module').then( m => m.OrdersPageModule)
  },
  {
    path: 'orders/new',
    data: { name: 'new-order', permName: 'orders', perms: ['create'] },
    canActivate: [CanOpenRoute],
    loadChildren: () => import('./order-form/order-form.module').then( m => m.OrderFormPageModule)
  },
  {
    path: 'orders/:id',
    data: { name: 'view-order', permName: 'orders', perms: ['view', 'update'] },
    canActivate: [CanOpenRoute],
    loadChildren: () => import('./order-form/order-form.module').then( m => m.OrderFormPageModule)
  },
  {
    path: 'calendar',
    data: { name: 'calendar', permName: 'calendar', perms: ['view', 'update'] },
    canActivate: [CanOpenRoute],
    loadChildren: () => import('./calendar/calendar.module').then( m => m.CalendarPageModule)
  },
  {
    path: 'repairs',
    data: { name: 'repairs' },
    canActivate: [CanOpenRoute],
    loadChildren: () => import('./repairs/repairs.module').then( m => m.RepairsPageModule)
  },
  {
    path: 'extra-services',
    data: { name: 'extra-services' },
    canActivate: [CanOpenRoute],
    loadChildren: () => import('./extra-services/extra-services.module').then( m => m.ExtraServicesPageModule)
  },
  {
    path: 'dynamic-form',
    loadChildren: () => import('./dynamic-form/dynamic-form.module').then( m => m.DynamicFormPageModule)
  },
  {
    path: 'order-products',
    data: { name: 'order-products', permName: 'orders', perms: ['view', 'update'] },
    loadChildren: () => import('./order-products/order-products.module').then( m => m.OrderProductsPageModule)
  },
  // Not Authed ===========================================
  {
    path: 'not-authed',
    data: { name: 'not-authed' },
    loadChildren: () => import('./not-authed/not-authed.module').then( m => m.NotAuthedPageModule)
  },
  // Not Found ===========================================
  {
    path: '**',
    data: { name: 'page404' },
    loadChildren: () => import('./page404/page404.module').then( m => m.Page404PageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
