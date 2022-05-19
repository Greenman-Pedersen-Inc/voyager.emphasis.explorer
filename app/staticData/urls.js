define(function() {
    const baseURL = 'https://www.njvoyager.org/arcgis/rest/services/Voyager20180807/MapServer/exts/VoyagerSOE/';
    const apiURL = 'https://gpi.services/api-ea/v1/';
    return {
        topLocationsSunglareURL: baseURL + 'TopLocationsSunglare',
        topSriSunglareURL: baseURL + 'TopSriSunglare',
        timeSummarySunglareURL: baseURL + 'TimeSummarySunglare',
        searchURL: baseURL + 'Search',
        searchCountURL: baseURL + 'SearchCount',
        reportURL: baseURL + 'PredictiveReport',
        urbanSummaryURL: baseURL + 'UrbanStatistics',
        fcSummaryURL: baseURL + 'FunctionalClassStatistics',
        speedSummaryURL: baseURL + 'SpeedStatistics',
        fatalSriURL: baseURL + 'TopFatalSriSunglare',
        crashRecordURL: baseURL + 'CrashRecord',

        emphasisAreaDataURL: baseURL + 'EmphasisAreaData',
        emphasisArea_AnnualStatistics: baseURL + 'EmphasisArea_AnnualStatistics',
        emphasisArea_CrashTypeStatistics: baseURL + 'EmphasisArea_CrashTypeStatistics',
        emphasisArea_CountyStatistics: baseURL + 'EmphasisArea_CountyStatistics',
        emphasisArea_AgeStatistics: baseURL + 'EmphasisArea_AgeStatistics',
        emphasisArea_RollingAverageStatistics: baseURL + 'EmphasisArea_RollingAverageStatistics',
        emphasisArea_RelatedBehaviorStatistics: baseURL + 'EmphasisArea_RelatedBehaviorStatistics',

        emphasisAreaGeojsonURL: apiURL + 'ea_geojson/',
        emphasisAreaMvtURL: apiURL + 'mvt/',
        emphasisAreaMvtCountyURL: apiURL + 'mvt_county/',
        emphasisAreaMvtMuniURL: apiURL + 'mvt_muni/',
        emphasisAreaQueryURL: apiURL + 'query/',
        emphasisAreaCrashIDQueryURL: apiURL + 'postQuery/',
        emphasisAreaPageQueryURL: apiURL + 'pageQuery/',

        countyJurisdictionsURL: apiURL + 'mvt/county_boundaries_of_nj/{z}/{x}/{y}?geom_column=wkb_geometry&columns=mun_cty_co',
        municipalJurisdictionsURL: apiURL + 'mvt/municipal_boundaries_of_nj/{z}/{x}/{y}?geom_column=wkb_geometry&columns=mun_mu%2C+county%2C+mun_cty_co',
    }
})