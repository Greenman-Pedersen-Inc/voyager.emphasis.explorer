define(
    [
        './app/Utilities.js',
        "./app/staticData/urls.js",
        "./app/variables/createPayloadRequest.js",
        "./app/components/statistics/StackedColumnChart.js",
        "esri/request",
    ],
    function(
        Utilities,
        urls,
        payloadHelper,
        StackedColumnChart,
        esriRequest
    ) {
        return function SpeedSummaryTable() {
            const self = this;
            const speedSummaryContainer = document.getElementById('SpeedSummaryChartContainer');
            const speedSummaryChart = document.getElementById('SpeedSummaryChart');
            const speedSummaryLoading = document.getElementById('SpeedSummaryChartLoading');
            this.requestUrl = urls.speedSummaryURL;
            this.attribute = 'SpeedData';
            this.chartSeriesNames = [
                { data: "Fatal_Count", title: "Fatal" },
                { data: "Incap_Count", title: "Incap." },
                { data: "Mod_Inj_Count", title: "Mod. Inj." },
                { data: "Comp_Pain_Count", title: "Compl. Pain" },
                { data: "Prop_Dmg_Count", title: "Prop. Dmg." }
            ];
            this.chartColumns = ['< 10 mph', '10-19 mph', '20-29 mph', '30-39 mph', '40-49 mph', '50-59 mph', '≥ 60 mph'];

            this.update = function(reportParams) {
                var requestParams = payloadHelper.CreatePayloadRequest(reportParams);

                // speedSummaryContainer.classList.add('hidden');
                speedSummaryLoading.classList.remove('hidden');

                return esriRequest(self.requestUrl, { query: requestParams }).then(function(response) {
                    speedSummaryContainer.classList.remove('hidden');
                    speedSummaryLoading.classList.add('hidden');

                    if (self.chart) {
                        self.chart.update(response.data[self.attribute], self.chartSeriesNames, self.chartColumns)
                    } else {
                        self.chart = new StackedColumnChart(response.data[self.attribute], self.chartColumns, self.chartSeriesNames, speedSummaryChart);
                    }
                }, Utilities.errorHandler);
            }
        }
    });