define([
    './js/widgets/UserInfo.js',
    './app/components/filterMenu/headers.js',
    './app/components/filterMenu/generateReportButton.js',
    './app/components/filterMenu/tooltips.js',
    './app/components/filterMenu/queryString.js',
    './app/components/filterMenu/tour.js',
    './app/ui/data/DataPage.js',
    './app/ui/filterMenu/RadioHeaders.js',
    './app/ui/filterMenu/LocationFilters.js',
    './app/ui/filterMenu/TemporalFilters.js',
    './app/ui/map/MapPage.js',
    './app/ui/statistics/StatisticsPage.js',
    './app/variables/filterParameters.js',
], function (
    UserInfo,
    Headers,
    ReportButton,
    tooltips,
    queryString,
    TourHelper,
    DataPage,
    RadioHeaders,
    LocationFilters,
    TemporalFilters,
    MapPage,
    StatisticsPage,
    FilterParameters
) {
    function initiatePage(userInfo) {
        const self = this;

        this.filterParameters = new FilterParameters('lane_departure', 'Lane Departure');

        var mapPage = new MapPage(this, userInfo.credentials);
        var dataPage = new DataPage(this.filterParameters, userInfo.credentials);
        var statisticPage = new StatisticsPage(userInfo.credentials);

        var headers = new Headers();
        var reportButton = new ReportButton();
        var tourHelper = new TourHelper();
        var radioHeaders = new RadioHeaders(statisticPage, mapPage, dataPage);
        var locationFilters = new LocationFilters(statisticPage, mapPage, dataPage, userInfo.credentials);
        var temporalFilters = new TemporalFilters(statisticPage, mapPage, dataPage, userInfo.credentials);

        this.filterParameters.setUser(userInfo.username);

        statisticPage.initialize(this.filterParameters);

        radioHeaders.initiate(this.filterParameters);
        locationFilters.initiate(this.filterParameters, userInfo.username);
        temporalFilters.initiate(this.filterParameters);

        tooltips.initalizeTooltips(); // enable all tooltips
        tourHelper.initiate(); // enable tour
        headers.initiate(); // init header color changers
        // reportParameters.initiate(this.filterParameters);  // initiate crash attributes list
        reportButton.initiate(this.filterParameters, tourHelper);
        queryString.updateQueryString(this.filterParameters);

        document.querySelectorAll('.display-toggle').forEach(function (element) {
            element.addEventListener('click', function (event) {
                document.querySelectorAll('.display-toggle').forEach(function (toggle) {
                    toggle.classList.remove('active');
                });

                document.querySelectorAll('.content-section').forEach(function (section) {
                    section.classList.add('hidden');
                    section.classList.remove('active-tab');
                });

                this.classList.add('active');
                document.querySelector(`#${this.getAttribute('data-target')}`).classList.remove('hidden');
                document.querySelector(`#${this.getAttribute('data-target')}`).classList.add('active-tab');

                if (this.id == 'DataPill') {
                    dataPage.resize();
                } else if (this.id === 'StatisticsPill') {
                    statisticPage.resize(self.filterParameters);
                } else if (this.id === 'MapPill') {
                    mapPage.resize();
                }
            });
        });
    }

    return {
        initiatePage: initiatePage,
    };
});
