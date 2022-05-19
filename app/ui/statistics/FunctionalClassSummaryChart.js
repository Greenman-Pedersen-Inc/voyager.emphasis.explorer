define(
    [
        './app/Utilities.js',
        "./app/staticData/urls.js",
        "./app/components/statistics/HeatmapChart.js",
        "esri/request",
    ],
    function(
        Utilities,
        urls,
        HeatmapChart,
        esriRequest
    ) {

        return function FunctionalClassSummaryChart() {
            const self = this;
            const FcSummaryContainer = document.getElementById('FcSummaryChartContainer');
            const FcSummaryChart = document.getElementById('FcSummaryChart');
            const FcSummaryChartLoading = document.getElementById('FcSummaryChartLoading');
            const FcSummaryChartTitleDiv = document.getElementById('FcSummaryChartTitle');

            this.requestUrl = urls.fcSummaryURL;
            this.attribute = 'FunctionalClassData';
            this.chartSeriesNames = [
                { data: 'Interstate', title: 'Interstate' },
                { data: 'Principal Arterial – Other Freeway/Expressway', title: ('Principal Arterial(Other FW/EW)') },
                { data: 'Principal Arterial – Other', title: 'Principal Arterial(Other)' },
                { data: 'Minor Arterial', title: 'Minor Arterial' },
                { data: 'Major Collector', title: 'Major Collector' },
                { data: 'Minor Collector', title: 'Minor Collector' },
                { data: 'Local', title: 'Local' }
            ];
            this.chartColumns = ['< 10 mph', '10-19 mph', '20-29 mph', '30-39 mph', '40-49 mph', '50-59 mph', '≥ 60 mph'];

            this.update = function(filterParameters) {
                var requestParams = filterParameters.createPayloadRequest();

                FcSummaryChartLoading.classList.remove('hidden');

                return esriRequest(self.requestUrl, { query: requestParams }).then(function(response) {
                    FcSummaryContainer.classList.remove('hidden');
                    FcSummaryChartLoading.classList.add('hidden');

                    if (self.chart) {
                        self.chart.update(response.data[self.attribute], self.chartSeriesNames, self.chartColumns)
                    } else {
                        self.chart = new HeatmapChart(response.data[self.attribute], self.chartColumns, self.chartSeriesNames, FcSummaryChart);
                    }

                    FcSummaryChartTitleDiv.innerHTML = "Crash Breakdown by Functional Class and Posted Speed Limit - " + filterParameters.summary.label;
                }, Utilities.errorHandler);
            }
        }
    });