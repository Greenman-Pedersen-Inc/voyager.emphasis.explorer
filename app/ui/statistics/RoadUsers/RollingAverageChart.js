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
        const chart = document.getElementById('RoadUsersRollingAverageChart');
        const chartContainer = document.getElementById('RoadUsersRollingAverageChartContainer');
        const chartLoading = document.getElementById('RoadUsersRollingAverageChartLoading');
        const chartTitle = document.getElementById('RoadUsersRollingAverageChartTitle');

        return function RoadUsersRollingAverageChart() {
            const self = this;
            this.requestUrl = urls.emphasisArea_RollingAverageStatistics;
            this.updateChartTitle = function(filterParameters) {
                chartTitle.innerHTML = "5 Year Rolling Average - " + filterParameters.subCategory.label;
            }
            this.update = function(filterParameters) {
                var dataAttribute = filterParameters.subCategory.value + "AverageData";
                chartLoading.classList.remove('hidden');
                chartContainer.classList.remove('hidden');

                var requestParams = filterParameters.createPayloadRequest();

                return esriRequest(self.requestUrl, { query: requestParams }).then(function(response) {
                    var chartData = response.data.EmphasisAreaData['RoadUserAverageData'][dataAttribute];

                    chartContainer.classList.remove('hidden');
                    chartLoading.classList.add('hidden');

                    var formattedData = formatData(chartData, filterParameters.subCategory.value);

                    if (self.chart) {
                        self.chart.update(formattedData);
                    } else {
                        self.chart = new MixedBarLineChart(formattedData, chart);
                    }
                }, Utilities.errorHandler);
            }
        }

        function formatData(data, categoryLabel) {
            // labels: years
            // y-axis titles: total, serious injury, fatality
            // series: Total(bar), Fatal(line), SI(line)
            var fileName = 'Rolling_Avg_Chart' + categoryLabel;

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
                "stroke": { width: [0, 4, 4] },
                "export": {
                    csv: {
                        filename: fileName,
                        columnDelimiter: ',',
                        headerCategory: 'Year',
                        dateFormatter(timestamp) {
                            return new Date(timestamp).toDateString()
                        }
                    },
                    svg: {
                        filename: fileName,
                    },
                    png: {
                        filename: fileName,
                    }
                }
            }
        }


    });