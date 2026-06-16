import { Routes } from '@angular/router';
import { NavigationComponent } from './modules/navigation/navigation.component';

export const APP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'kjusys/asset-dashboard',
    pathMatch: 'full',
  },
  {
    path: 'kjusys',
    component: NavigationComponent,
    children: [
      {
        path: 'asset-dashboard',
        loadChildren: () =>
          import('./modules/asset-dashboard/asset-dashboard.module')
            .then((m) => m.AssetDashboardModule)
            .catch((error) => {
              console.error('Error loading AssetDashboardModule', error);
              throw error;
            }),
      },
      {
        path: '**',
        redirectTo: 'asset-dashboard',
      },
    ],
  },
];
