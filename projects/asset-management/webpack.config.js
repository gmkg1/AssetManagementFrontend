const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const mf = require("@angular-architects/module-federation/webpack");
const path = require("path");
const share = mf.share;

const sharedMappings = new mf.SharedMappings();
sharedMappings.register(
  path.join(__dirname, '../../tsconfig.json'),[
    /* mapped paths to share */
    "@libs/left-menu-lib",
    "@libs/menu-header-lib",
    "@libs/shared-auth",
    "@libs/http-common",
  ]);

module.exports = {
  output: {
    uniqueName: "asset-management",
    publicPath: 'http://localhost:4205/',
    scriptType: 'text/javascript',
  },
  optimization: {
    runtimeChunk: false
  },   
  resolve: {
    alias: {
      ...sharedMappings.getAliases(),
    }
  },
  experiments: {
    outputModule: true
  },
  plugins: [
    new ModuleFederationPlugin({
        library: { type: "module" },
        name: "asset-management",
        filename: "remoteEntry.js",
        exposes: {
             // Example expose, user can add more modules here
             './Module': './projects/asset-management/src/app/app.module.ts',
          './AssetDashboardModule': './projects/asset-management/src/app/modules/asset-dashboard/asset-dashboard.module.ts',
          './ViewAssetsModule': './projects/asset-management/src/app/modules/asset-dashboard/asset-dashboard.module.ts',
          './ReturnLogModule': './projects/asset-management/src/app/modules/asset-dashboard/asset-dashboard.module.ts',
          './ReportsModule': './projects/asset-management/src/app/modules/asset-dashboard/asset-dashboard.module.ts',
          './IssueAssetModule': './projects/asset-management/src/app/modules/asset-dashboard/asset-dashboard.module.ts',
          './CreateAssetTagModule': './projects/asset-management/src/app/modules/asset-dashboard/asset-dashboard.module.ts',
          './CreateAssetModule': './projects/asset-management/src/app/modules/asset-dashboard/asset-dashboard.module.ts',
          './IssueLogModule': './projects/asset-management/src/app/modules/asset-dashboard/asset-dashboard.module.ts',
          './ReturnAssetModule': './projects/asset-management/src/app/modules/asset-dashboard/asset-dashboard.module.ts',
          './EditAssetModule': './projects/asset-management/src/app/modules/asset-dashboard/asset-dashboard.module.ts',










        },
        shared: share({
          "@angular/core": { singleton: true, strictVersion: true, requiredVersion: 'auto' }, 
          "@angular/common": { singleton: true, strictVersion: true, requiredVersion: 'auto' }, 
          "@angular/common/http": { singleton: true, strictVersion: true, requiredVersion: 'auto' }, 
          "@angular/router": { singleton: true, strictVersion: true, requiredVersion: 'auto' },
          "ngx-toastr": { singleton: true, strictVersion: true, requiredVersion: 'auto' },

          ...sharedMappings.getDescriptors()
        })
        
    }),
    sharedMappings.getPlugin()
  ],
};
