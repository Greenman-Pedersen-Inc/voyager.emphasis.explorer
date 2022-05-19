define(
    [
        './app/Utilities.js',
        "./app/staticData/urls.js",
        "./app/components/statistics/MixedBarLineChart.js",
        "esri/request",
    ],
    function(
        Utilities,
        urls,
        MixedBarLineChart,
        esriRequest
    ) {
        const dataAttribute = 'WorkzoneAverageData';
        const chart = document.getElementById('WorkzoneRollingAverageChart');
        const chartContainer = document.getElementById('WorkzoneRollingAverageChartContainer');
        const chartLoading = document.getElementById('WorkzoneRollingAverageChartLoading');
        const chartTitle = document.getElementById('WorkzoneRollingAverageChartTitle');

        return function WorkzoneRollingAverageChart() {
            const self = this;
            this.requestUrl = urls.emphasisArea_RollingAverageStatistics;
            // this.update = function (responseData) {
            //     var chartData = responseData.data.EmphasisAreaData['RoadUserAverageData'][dataAttribute];
            //     chartLoading.classList.remove('hidden');
            //     chartContainer.classList.remove('hidden');
            //     chartLoading.classList.add('hidden');

            //     var formattedData = formatData(chartData);

            //     if (self.chart) {
            //         self.chart.update(formattedData);
            //     } else {
            //         self.chart = new MixedBarLineChart(formattedData, chart);
            //     }
            // }
            this.updateChartTitle = function() {
                chartTitle.innerHTML = "5 Year Rolling Average - Work Zone";
            }
            this.update = function(filterParameters) {
                chartLoading.classList.remove('hidden');
                chartContainer.classList.remove('hidden');

                var requestParams = filterParameters.createPayloadRequest();

                return esriRequest(self.requestUrl, { query: requestParams }).then(function(response) {
                    var chartData = response.data.EmphasisAreaData['RoadUserAverageData'][dataAttribute];

                    chartContainer.classList.remove('hidden');
                    chartLoading.classList.add('hidden');

                    var formattedData = formatData(chartData);

                    if (self.chart) {
                        self.chart.update(formattedData);
                    } else {
                        self.chart = new MixedBarLineChart(formattedData, chart);
                    }
                }, Utilities.errorHandler);
            }
        }

        function formatData(data) {
            // labels: years
            // y-axis titles: total, serious injury, fatality
            // series: Total(bar), Fatal(line), SI(line)

            var labels = [];
            var dataHolder = {
                'Total': [],
                'Serious_Injury': [],
                'Fatal': []
            }
            var yaxis = [{
                    title: {
                        text: 'Total Injuries (5 Yr Rolling Avg)',
                    },
                    labels: {
                        formatter: function(val) {
                            return val.toLocaleString("en-US");
                        }
                    }
                },
                {
                    seriesName: 'Serious Injuries',
                    opposite: true,
                    title: {
                        text: 'Fatalities / Serious Injuries (5 Yr Rolling Avg)',
                    },
                    labels: {
                        formatter: function(val) {
                            return val.toLocaleString("en-US");
                        }
                    }
                },
                {
                    seriesName: 'Serious Injuries',
                    show: false
                },
            ];

            data.forEach(element => {
                labels.push(element['Year'].toString());
                dataHolder['Total'].push(element['Total']);
                dataHolder['Serious_Injury'].push(element['Serious_Injury']);
                dataHolder['Fatal'].push(element['Fatal']);
            });

            var series = [
                { name: 'Total Injuries', type: 'column', data: Object.values(dataHolder['Total']) },
                { name: 'Serious Injury', type: 'line', data: Object.values(dataHolder['Serious_Injury']) },
                { name: 'Fatality', type: 'line', data: Object.values(dataHolder['Fatal']) }
            ];

            return {
                "yaxis": yaxis,
                "series": series,
                "labels": labels,
                "datalabels": {
                    enabled: true,
                    enabledOnSeries: [1, 2]
                },
                "colors": ['#a1dbb2', '#f7a541', '#f45d4c'],
                "stroke": { width: [0, 4, 4] }
            }
        }
    });