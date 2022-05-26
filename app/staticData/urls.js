define(function() {
    const apiURL = 'https://gpi.services/api-ea/v1/';
    const baseURL = "http://127.0.0.1:50000/v1/";
    const eaURL = baseURL + 'emphasis-explorer/';
    const generalURL = baseURL + 'general/';

    return {
        searchURL: generalURL + 'search?',
        searchCountURL: generalURL + 'search-count?',
        crashRecordURL: generalURL + 'crash-record?',
        // countyJurisdictionsURL: generalURL + 'mvt/county_boundaries_of_nj_3857/{z}/{x}/{y}?geom_column=geom_simplified&columns=mun_cty_co',
        // municipalJurisdictionsURL: generalURL + 'mvt/municipal_boundaries_of_nj_3857/{z}/{x}/{y}?geom_column=geom_simplified&columns=mun_mu%2C+county%2C+mun_cty_co',
        countyJurisdictionsURL: apiURL + 'mvt/county_boundaries_of_nj/{z}/{x}/{y}?geom_column=wkb_geometry&columns=mun_cty_co',
        municipalJurisdictionsURL: apiURL + 'mvt/municipal_boundaries_of_nj/{z}/{x}/{y}?geom_column=wkb_geometry&columns=mun_mu%2C+county%2C+mun_cty_co',
        // emphasisAreaMvtURL: baseURL + 'mvt?',
        emphasisAreaQueryURL: baseURL + 'query?',
        emphasisAreaGeojsonURL:  eaURL + 'ea-geojson/',
        emphasisAreaCrashIDQueryURL:  eaURL + 'post-query?',
        emphasisAreaPageQueryURL:  eaURL + 'page-query/',
        emphasisAreaStatistics: eaURL + 'get-statistics?',

        emphasisAreaMvtURL: apiURL + 'mvt/',
        emphasisAreaMvtCountyURL: eaURL + 'mvt-county/',
        emphasisAreaMvtMuniURL: eaURL + 'mvt-muni/',
        emphasisAreaMvtClusterURL: eaURL + 'mvt-cluster/',
    }
})