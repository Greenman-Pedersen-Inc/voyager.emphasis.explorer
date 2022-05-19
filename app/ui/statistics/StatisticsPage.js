define([
    "./app/staticData/urls.js",
    "./app/ui/statistics/AnnualBodiesChart.js",
    "./app/ui/statistics/RollingAverageChart.js",
    "./app/ui/statistics/AgeBucketsChart.js",
    "./app/ui/statistics/CountyBodiesChart.js",
    "./app/ui/statistics/RelatedBehaviorChart.js",
    "./app/ui/statistics/CrashTypeChart.js",
    "./app/ui/statistics/RoadUsers/RoadUsersBreakdownChart.js",
    "./app/ui/statistics/RoadUsers/RollingAverageChart.js",
    "./app/ui/statistics/DriverBehavior/DriverBehaviorBreakdownChart.js",
    "./app/ui/statistics/DriverBehavior/RollingAverageChart.js",
], function(
    urls,
    AnnualBodiesChart,
    RollingAverageChart,
    AgeBucketsChart,
    CountyBodiesChart,
    RelatedBehaviorChart,
    CrashTypeChart,
    RoadUsersBreakdownChart,
    RoadUsersRollingAverageChart,
    DriverBehaviorBreakdownChart,
    DriverBehaviorRollingAverageChart,
) {
    return function StatisticsPage() {
        const self = this;
        this.requestUrl = urls.emphasisAreaDataURL;

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

            if (filterParameters.category.value === 'roadusers') {
                $("#generalEmphasisAreaChartsContainer").addClass("hidden");
                $("#driverBehaviorChartsContainer").addClass("hidden");
                $("#roadUsersChartsContainer").removeClass("hidden");
            } else if (filterParameters.category.value === 'driverbehavior') {
                $("#generalEmphasisAreaChartsContainer").addClass("hidden");
                $("#roadUsersChartsContainer").addClass("hidden");
                $("#driverBehaviorChartsContainer").removeClass("hidden");
            } else {
                $("#generalEmphasisAreaChartsContainer").removeClass("hidden");
                $("#driverBehaviorChartsContainer").addClass("hidden");
                $("#roadUsersChartsContainer").addClass("hidden");
            }

            if (filterParameters.category.value === 'roadusers') {
                Promise.all([
                    self.roadUsersBreakdownChart.update(filterParameters),
                    self.roadUsersRollingAverageChart.update(filterParameters),
                ]).then(() => {
                    document.querySelectorAll('#filterAccordion .card').forEach(element => {
                        element.classList.remove('paused');
                    });
                });
            } else if (filterParameters.category.value === 'driverbehavior') {
                Promise.all([
                    self.driverBehaviorBreakdownChart.update(filterParameters),
                    self.driverBehaviorRollingAverageChart.update(filterParameters),
                ]).then(() => {
                    document.querySelectorAll('#filterAccordion .card').forEach(element => {
                        element.classList.remove('paused');
                    });
                });
            } else {
                Promise.all([
                    self.annualBodiesChart.update(filterParameters),
                    self.crashTypeChart.update(filterParameters),
                    self.rollingAverageChart.update(filterParameters),
                    self.ageBucketsChart.update(filterParameters),
                    self.countyBodiesChart.update(filterParameters),
                    self.relatedBehaviorChart.update(filterParameters),
                ]).then(() => {
                    document.querySelectorAll('#filterAccordion .card').forEach(element => {
                        element.classList.remove('paused');
                    });
                });
            }
        }

        function UpdateChartTitles(filterParameters) {
            var category = filterParameters.category.value;
            if (category === 'lanedeparture' || category === 'intersection' || category === 'pedbike') {
                self.annualBodiesChart.updateChartTitle(filterParameters);
                self.rollingAverageChart.updateChartTitle(filterParameters);
                self.ageBucketsChart.updateChartTitle(filterParameters);
                self.countyBodiesChart.updateChartTitle(filterParameters);
                self.relatedBehaviorChart.updateChartTitle(filterParameters);
                self.crashTypeChart.updateChartTitle(filterParameters);
            } else if (category === 'roadusers') {
                self.roadUsersBreakdownChart.updateChartTitle(filterParameters);
                self.roadUsersRollingAverageChart.updateChartTitle(filterParameters);
            } else if (category === 'driverbehavior') {
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
            if (category === 'lanedeparture' || category === 'intersection' || category === 'pedbike') {
                self.annualBodiesChart.chart.chart._windowResize();
                self.rollingAverageChart.chart.chart._windowResize();
                self.ageBucketsChart.chart.chart._windowResize();
                self.countyBodiesChart.chart.chart._windowResize();
                self.relatedBehaviorChart.chart.chart._windowResize();
                self.crashTypeChart.chart.chart._windowResize();
            } else if (category === 'roadusers') {
                self.roadUsersBreakdownChart.chart.chart._windowResize();
                self.roadUsersRollingAverageChart.chart.chart._windowResize();
            } else if (category === 'driverbehavior') {
                self.driverBehaviorBreakdownChart.chart.chart._windowResize();
                self.driverBehaviorRollingAverageChart.chart.chart._windowResize();
            }
        }
    }
});