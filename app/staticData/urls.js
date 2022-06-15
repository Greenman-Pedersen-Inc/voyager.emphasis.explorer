define(function () {
    const baseURL = "http://127.0.0.1:50000";
    const apiURL = baseURL + '/v1';

    // const baseURL = 'https://gpi.services/test-api';
    // const apiURL = 'https://gpi.services/test-api/v1';
    const eaURL = apiURL + '/emphasis-explorer';
    const generalURL = apiURL + '/general';

    return {
        adminURL: baseURL,
        searchURL: generalURL + '/search?',
        searchCountURL: generalURL + '/search-count?',
        crashRecordURL: generalURL + '/crash-record?',
        crashURL: apiURL + '/crash',
        countyJurisdictionsURL:
            apiURL + '/mvt/county_boundaries_of_nj/{z}/{x}/{y}?geom_column=wkb_geometry&columns=mun_cty_co',
        municipalJurisdictionsURL:
            apiURL +
            '/mvt/municipal_boundaries_of_nj/{z}/{x}/{y}?geom_column=wkb_geometry&columns=mun_mu%2C+county%2C+mun_cty_co',
        emphasisAreaQueryURL: apiURL + '/query?',
        emphasisAreaGeojsonURL: eaURL + '/ea-geojson/',
        emphasisAreaCrashIDQueryURL: eaURL + '/post-query?',
        emphasisAreaPageQueryURL: eaURL + '/page-query/',
        emphasisAreaStatistics: eaURL + '/get-statistics?',

        emphasisAreaMvtURL: apiURL + '/mvt/',
        emphasisAreaMvtCountyURL: eaURL + '/mvt-county/',
        emphasisAreaMvtMuniURL: eaURL + '/mvt-muni/',
        emphasisAreaMvtClusterURL: eaURL + '/mvt-cluster/',
    };
});
