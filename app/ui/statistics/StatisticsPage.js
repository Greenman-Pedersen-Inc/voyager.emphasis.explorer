define([
    "./app/staticData/urls.js",
    "./app/Utilities.js",
    "./app/ui/statistics/AgeBucketsChart.js",
    "./app/ui/statistics/AnnualBodiesChart.js",
    "./app/ui/statistics/CountyBodiesChart.js",
    "./app/ui/statistics/CrashTypeChart.js",
    "./app/ui/statistics/RelatedBehaviorChart.js",
    "./app/ui/statistics/RoadUsers/RoadUsersBreakdownChart.js",
    "./app/ui/statistics/DriverBehavior/DriverBehaviorBreakdownChart.js",
    "./app/ui/statistics/RollingAverageChart.js",
    "./app/ui/statistics/RoadUsers/RollingAverageChart.js",
    "./app/ui/statistics/DriverBehavior/RollingAverageChart.js",
], function(
    urls,
    Utilities,
    AnnualBodiesChart,
    AgeBucketsChart,
    CountyBodiesChart,
    RelatedBehaviorChart,
    CrashTypeChart,
    RoadUsersBreakdownChart,
    DriverBehaviorBreakdownChart,
    RollingAverageChart,
    RoadUsersRollingAverageChart,
    DriverBehaviorRollingAverageChart,
) {
    return function StatisticsPage(credentials) {
        const self = this;
        this.requestUrl = urls.emphasisAreaStatistics;
        const headers = {
            headers: {
                token: credentials.token
            }
        }

        // Generic EA charts
        this.annualBodiesChart = new AnnualBodiesChart();
        this.rollingAverageChart = new RollingAverageChart();
        this.ageBucketsChart = new AgeBucketsChart();
        this.countyBodiesChart = new CountyBodiesChart();
        this.relatedBehaviorChart = new RelatedBehaviorChart();
        this.crashTypeChart = new CrashTypeChart();

        // Road Users charts
        this.roadUsersBreakdownChart = new RoadUsersBreakdownChart();
        this.roadUsersRollingAverageChart = new RoadUsersRollingAverageChart();

        // Driver Behavior charts
        this.driverBehaviorBreakdownChart = new DriverBehaviorBreakdownChart();
        this.driverBehaviorRollingAverageChart = new DriverBehaviorRollingAverageChart();

        function UpdateCharts(filterParameters) {
            let chartLoadingElements = document.getElementsByClassName("loading chart");
            for (i = 0; i < chartLoadingElements.length; i++) {
                chartLoadingElements[i].classList.remove('hidden');
            }

            if (filterParameters.category.value === 'road_users') {
                $("#generalEmphasisAreaChartsContainer").addClass("hidden");
                $("#driverBehaviorChartsContainer").addClass("hidden");
                $("#roadUsersChartsContainer").removeClass("hidden");
            } else if (filterParameters.category.value === 'driver_behavior') {
                $("#generalEmphasisAreaChartsContainer").addClass("hidden");
                $("#roadUsersChartsContainer").addClass("hidden");
                $("#driverBehaviorChartsContainer").removeClass("hidden");
            } else {
                $("#generalEmphasisAreaChartsContainer").removeClass("hidden");
                $("#driverBehaviorChartsContainer").addClass("hidden");
                $("#roadUsersChartsContainer").addClass("hidden");
            }

            // make fetch request to get all chart data
            var requestParams = filterParameters.createPayloadRequest();
            var searchParams = new URLSearchParams(requestParams);
            fetch(self.requestUrl + searchParams.toString(), headers)
                .then((response) => {
                    if (response.status === 200) {
                        response.json()
                            .then((data) => {
                                const chartData = data[requestParams.category];
                                if (filterParameters.category.value === 'road_users') {
                                    Promise.all([
                                        self.roadUsersBreakdownChart.update(chartData, filterParameters),
                                        self.roadUsersRollingAverageChart.update(chartData, filterParameters),
                                    ]).then(() => {
                                        document.querySelectorAll('#filterAccordion .card').forEach(element => {
                                            element.classList.remove('paused');
                                        });
                                    });
                                } else if (filterParameters.category.value === 'driver_behavior') {
                                    Promise.all([
                                        self.driverBehaviorBreakdownChart.update(chartData, filterParameters),
                                        self.driverBehaviorRollingAverageChart.update(chartData, filterParameters),
                                    ]).then(() => {
                                        document.querySelectorAll('#filterAccordion .card').forEach(element => {
                                            element.classList.remove('paused');
                                        });
                                    });
                                } else {
                                    Promise.all([
                                        self.annualBodiesChart.update(chartData, filterParameters),
                                        self.crashTypeChart.update(chartData, filterParameters),
                                        self.rollingAverageChart.update(chartData, filterParameters),
                                        self.ageBucketsChart.update(chartData, filterParameters),
                                        self.countyBodiesChart.update(chartData, filterParameters),
                                        self.relatedBehaviorChart.update(chartData, filterParameters),
                                    ]).then(() => {
                                        document.querySelectorAll('#filterAccordion .card').forEach(element => {
                                            element.classList.remove('paused');
                                        });
                                    });
                                }
                            });
                    }
                    else {
                        Utilities.errorHandler(response.error, response.message);
                    }
                });
        }

        function UpdateChartTitles(filterParameters) {
            var category = filterParameters.category.value;
            if (category === 'lane_departure' || category === 'intersection' || category === 'ped_cyclist') {
                self.annualBodiesChart.updateChartTitle(filterParameters);
                self.rollingAverageChart.updateChartTitle(filterParameters);
                self.ageBucketsChart.updateChartTitle(filterParameters);
                self.countyBodiesChart.updateChartTitle(filterParameters);
                self.relatedBehaviorChart.updateChartTitle(filterParameters);
                self.crashTypeChart.updateChartTitle(filterParameters);
            } else if (category === 'road_users') {
                self.roadUsersBreakdownChart.updateChartTitle(filterParameters);
                self.roadUsersRollingAverageChart.updateChartTitle(filterParameters);
            } else if (category === 'driver_behavior') {
                self.driverBehaviorBreakdownChart.updateChartTitle(filterParameters);
                self.driverBehaviorRollingAverageChart.updateChartTitle(filterParameters);
            }
        }

        this.initialize = function(filterParameters) {
            UpdateCharts(filterParameters);
            UpdateChartTitles(filterParameters);
        }

        this.update = function(filterParameters) {
            document.querySelectorAll('#filterAccordion .card').forEach(element => {
                element.classList.add('paused');
            });
            UpdateCharts(filterParameters);
            UpdateChartTitles(filterParameters);
        }

        this.resize = function(filterParameters) {
            var category = filterParameters.category.value;
            if (category === 'lane_departure' || category === 'intersection' || category === 'ped_cyclist') {
                self.annualBodiesChart.chart.chart._windowResize();
                self.rollingAverageChart.chart.chart._windowResize();
                self.ageBucketsChart.chart.chart._windowResize();
                self.countyBodiesChart.chart.chart._windowResize();
                self.relatedBehaviorChart.chart.chart._windowResize();
                self.crashTypeChart.chart.chart._windowResize();
            } else if (category === 'road_users') {
                self.roadUsersBreakdownChart.chart.chart._windowResize();
                self.roadUsersRollingAverageChart.chart.chart._windowResize();
            } else if (category === 'driver_behavior') {
                self.driverBehaviorBreakdownChart.chart.chart._windowResize();
                self.driverBehaviorRollingAverageChart.chart.chart._windowResize();
            }
        }
    }
});