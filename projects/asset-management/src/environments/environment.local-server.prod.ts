// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: true,
    mfe: {
        // Add remotes here as needed
        admissions: 'http://localhost:4201',
        core: 'http://localhost:4202',
        sim: 'http://localhost:4203',
        applicant: 'http://localhost:4204',
        'asset-management': 'http://localhost:4205',
    },
    publicPath: 'http://localhost:4200/',

    baseUrl: 'https://amendments-ministries-islands-immigration.trycloudflare.com/api/',
    project: 'shell',
    baseRoute: 'kjusys',
    local: true,
};
