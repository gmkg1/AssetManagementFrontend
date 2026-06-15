import { Component } from '@angular/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {
  currentUser = {
    userId: 'admin',
    userName: 'Administrator',
  };

  leftMenuObject = {
    assets: {
      displayName: 'Assets',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`,
      isOpen: false,
      isPinned: false,
      subModule: [
        { displayName: 'Asset Dashboard', subPath: 'asset-dashboard', ngModuleName: 'AssetDashboardModule', pinned: false },
        { displayName: 'View Assets', subPath: 'view-assets', ngModuleName: 'ViewAssetsModule', pinned: false },
        { displayName: 'Issue Asset', subPath: 'issue-asset', ngModuleName: 'IssueAssetModule', pinned: false },
        { displayName: 'Issue Log', subPath: 'issue-log', ngModuleName: 'IssueLogModule', pinned: false },
        { displayName: 'Return Asset', subPath: 'return-asset', ngModuleName: 'ReturnAssetModule', pinned: false },
        { displayName: 'Return Log', subPath: 'return-log', ngModuleName: 'ReturnLogModule', pinned: false },
        { displayName: 'Reports', subPath: 'reports', ngModuleName: 'ReportsModule', pinned: false },
        { displayName: 'Create Asset', subPath: 'create-asset', ngModuleName: 'CreateAssetModule', pinned: false },
        { displayName: 'Create Asset Tag', subPath: 'create-asset-tag', ngModuleName: 'CreateAssetTagModule', pinned: false },
      ],
    },
  };

  menuToggle(): void {
    // menu header mobile toggle is handled internally by the shared lib
  }
}

