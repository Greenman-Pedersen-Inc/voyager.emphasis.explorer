define(
    [
        './app/Utilities.js',
        "./app/staticData/urls.js",
        "./app/variables/createPayloadRequest.js",
        "./app/components/statistics/PieChart.js",
        "esri/request",
    ],
    function(
        Utilities,
        urls,
        payloadHelper,
        PieChart,
        esriRequest
    ) {
        const urbanSummaryChart = document.getElementById('UrbanSummaryChart');
        const urbanSummaryChartContainer = document.getElementById('UrbanSummaryChartContainer');
        const urbanSummaryChartLoading = document.getElementById('UrbanSummaryChartLoading');



        return function UrbanSummaryChart() {
            const self = this;
            this.urbanSummaryChart = document.getElementById('UrbanSummaryChart');
            this.requestUrl = urls.urbanSummaryURL;
            this.attribute = 'UrbanData';
            this.ChartColumns = { data: "Crash_Count", title: "Total Crashes" },
                this.ChartSeries = [];

            this.update = function(reportParams) {
                // urbanSummaryChartContainer.classList.add('hidden');
                urbanSummaryChartLoading.classList.remove('hidden');

                var requestParams = payloadHelper.CreatePayloadRequest(reportParams);

                return esriRequest(self.requestUrl, { query: requestParams }).then(function(response) {
                    urbanSummaryChartContainer.classList.remove('hidden');
                    urbanSummaryChartLoading.classList.add('hidden');
                    self.ChartSeries = [];

                    var crashCountArray = [];
                    response.data[self.attribute].forEach(element => {
                        crashCountArray.push(element[self.ChartColumns.data]);
                        if (element['Label'] == 'Y') { self.ChartSeries.push("Yes") } else { self.ChartSeries.push("No") }
                    });

                    if (self.chart) {
                        self.chart.update(crashCountArray, self.ChartSeries)
                    } else {
                        self.chart = new PieChart(crashCountArray, self.ChartSeries, self.urbanSummaryChart, null);
                    }
                }, Utilities.errorHandler);
            }
        }
    });