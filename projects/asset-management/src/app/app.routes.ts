import { Routes } from '@angular/router';
import { SharedAuthComponent } from '@libs/shared-auth';
import { NavigationComponent } from './modules/navigation/navigation.component';

export const APP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'kjusys/asset-dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: SharedAuthComponent,
    data: {
      module: 'asset-management',
    },
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
        path: 'view-assets',
        loadChildren: () =>
          import('./modules/asset-dashboard/asset-dashboard.module')
            .then((m) => m.AssetDashboardModule)
            .catch((error) => {
               console.error('Error loading AssetDashboardModule', error);
               throw error;
            }),
      },
      {
        path: 'return-log',
        loadChildren: () =>
          import('./modules/asset-dashboard/asset-dashboard.module')
            .then((m) => m.AssetDashboardModule)
            .catch((error) => {
               console.error('Error loading AssetDashboardModule', error);
               throw error;
            }),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./modules/asset-dashboard/asset-dashboard.module')
            .then((m) => m.AssetDashboardModule)
            .catch((error) => {
               console.error('Error loading AssetDashboardModule', error);
               throw error;
            }),
      },
      {
        path: 'issue-asset',
        loadChildren: () =>
          import('./modules/asset-dashboard/asset-dashboard.module')
            .then((m) => m.AssetDashboardModule)
            .catch((error) => {
               console.error('Error loading AssetDashboardModule', error);
               throw error;
            }),
      },
      {
        path: 'create-asset-tag',
        loadChildren: () =>
          import('./modules/asset-dashboard/asset-dashboard.module')
            .then((m) => m.AssetDashboardModule)
            .catch((error) => {
               console.error('Error loading AssetDashboardModule', error);
               throw error;
            }),
      },
      {
        path: 'create-asset',
        loadChildren: () =>
          import('./modules/asset-dashboard/asset-dashboard.module')
            .then((m) => m.AssetDashboardModule)
            .catch((error) => {
               console.error('Error loading AssetDashboardModule', error);
               throw error;
            }),
      },
      {
        path: 'issue-log',
        loadChildren: () =>
          import('./modules/asset-dashboard/asset-dashboard.module')
            .then((m) => m.AssetDashboardModule)
            .catch((error) => {
               console.error('Error loading AssetDashboardModule', error);
               throw error;
            }),
      },
      {
        path: 'return-asset',
        loadChildren: () =>
          import('./modules/asset-dashboard/asset-dashboard.module')
            .then((m) => m.AssetDashboardModule)
            .catch((error) => {
               console.error('Error loading AssetDashboardModule', error);
               throw error;
            }),
      },
      {
        path: 'edit-asset/:id',
        loadChildren: () =>
          import('./modules/asset-dashboard/asset-dashboard.module')
            .then((m) => m.AssetDashboardModule)
            .catch((error) => {
               console.error('Error loading AssetDashboardModule', error);
               throw error;
            }),
      },
      {
        path: 'edit-warranty-licenses/:id',
        loadChildren: () =>
          import('./modules/asset-dashboard/asset-dashboard.module')
            .then((m) => m.AssetDashboardModule)
            .catch((error) => {
               console.error('Error loading AssetDashboardModule', error);
               throw error;
            }),
      },










    ],
  },
];
