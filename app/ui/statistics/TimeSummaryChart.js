define(
    [
        './app/Utilities.js',
        "./app/staticData/urls.js",
        "./app/components/statistics/LineChart.js",
        "esri/request",
    ],
    function(
        Utilities,
        urls,
        LineChart,
        esriRequest
    ) {
        const timeSummaryChart = document.getElementById('TimeSummaryChart');
        const timeSummaryChartContainer = document.getElementById('TimeSummaryChartContainer');
        const timeSummaryChartLoading = document.getElementById('TimeSummaryChartLoading');
        const timeSummaryChartTitleDiv = document.getElementById('TimeSummaryChartTitle');

        return function TimeSummaryChart() {
            const self = this;
            this.requestUrl = urls.timeSummarySunglareURL;
            this.update = function(filterParameters) {
                timeSummaryChartLoading.classList.remove('hidden');

                var requestParams = filterParameters.createPayloadRequest();

                return esriRequest(self.requestUrl, { query: requestParams }).then(function(response) {
                    var chartData = formatTimeData(response.data.TimeData);

                    timeSummaryChartContainer.classList.remove('hidden');
                    timeSummaryChartLoading.classList.add('hidden');

                    if (self.chart) {
                        self.chart.update(chartData[0], chartData[1], timeSummaryChart);
                    } else {
                        self.chart = new LineChart(chartData[0], chartData[1], timeSummaryChart);
                    }

                    timeSummaryChartTitleDiv.innerHTML = "Total Crashes from 5 AM to 8 PM - " + filterParameters.summary.label;
                }, Utilities.errorHandler);
            }
        }


        function formatTimeData(timeData) {
            // labels will be the hours between 5AM and 8PM. Data will be crash count
            var labels = [];
            var crashCount = {};

            for (var t = 5; t <= 20; t++) {
                crashCount[t] = 0;

                var labelFormatted = t + " AM";
                if (t == 12) { labelFormatted = t + " PM"; } else if (t > 12) {
                    labelFormatted = (t - 12) + " PM";
                }
                labels.push(labelFormatted);
            }

            for (var i = 0; i < timeData.length; i++) {
                if (timeData[i].Hour >= 5 && timeData[i].Hour <= 20) {
                    crashCount[timeData[i].Hour] = timeData[i].Crash_Count;
                }
            }

            var ySeries = [{
                name: 'Total Crashes',
                data: Object.values(crashCount)
            }];
            return [ySeries, labels];
        }
    });