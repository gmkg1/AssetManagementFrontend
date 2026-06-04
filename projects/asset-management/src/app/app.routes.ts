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
          import('./modules/view-assets/view-assets.module')
            .then((m) => m.ViewAssetsModule)
            .catch((error) => {
               console.error('Error loading ViewAssetsModule', error);
               throw error;
            }),
      },
      {
        path: 'return-log',
        loadChildren: () =>
          import('./modules/return-log/return-log.module')
            .then((m) => m.ReturnLogModule)
            .catch((error) => {
               console.error('Error loading ReturnLogModule', error);
               throw error;
            }),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./modules/reports/reports.module')
            .then((m) => m.ReportsModule)
            .catch((error) => {
               console.error('Error loading ReportsModule', error);
               throw error;
            }),
      },
      {
        path: 'issue-asset',
        loadChildren: () =>
          import('./modules/issue-asset/issue-asset.module')
            .then((m) => m.IssueAssetModule)
            .catch((error) => {
               console.error('Error loading IssueAssetModule', error);
               throw error;
            }),
      },
      {
        path: 'create-asset-tag',
        loadChildren: () =>
          import('./modules/create-asset-tag/create-asset-tag.module')
            .then((m) => m.CreateAssetTagModule)
            .catch((error) => {
               console.error('Error loading CreateAssetTagModule', error);
               throw error;
            }),
      },
      {
        path: 'create-asset',
        loadChildren: () =>
          import('./modules/create-asset/create-asset.module')
            .then((m) => m.CreateAssetModule)
            .catch((error) => {
               console.error('Error loading CreateAssetModule', error);
               throw error;
            }),
      },
      {
        path: 'issue-log',
        loadChildren: () =>
          import('./modules/issue-log/issue-log.module')
            .then((m) => m.IssueLogModule)
            .catch((error) => {
               console.error('Error loading IssueLogModule', error);
               throw error;
            }),
      },
      {
        path: 'return-asset',
        loadChildren: () =>
          import('./modules/return-asset/return-asset.module')
            .then((m) => m.ReturnAssetModule)
            .catch((error) => {
               console.error('Error loading ReturnAssetModule', error);
               throw error;
            }),
      },
      {
        path: 'edit-asset',
        loadChildren: () =>
          import('./modules/edit-asset/edit-asset.module')
            .then((m) => m.EditAssetModule)
            .catch((error) => {
               console.error('Error loading EditAssetModule', error);
               throw error;
            }),
      },










    ],
  },
];
