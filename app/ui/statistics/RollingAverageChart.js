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
        return function RollingAverageChart() {
            const self = this;
            const dataAttribute = 'annual_bodies_rolling_average';
            const chart = document.getElementById('RollingAverageChart');
            const chartContainer = document.getElementById('RollingAverageChartContainer');
            const chartLoading = document.getElementById('RollingAverageChartLoading');
            const chartTitle = document.getElementById('RollingAverageChartTitle');

            this.updateChartTitle = function (filterParameters) {
                chartTitle.innerHTML = "5 Year Rolling Average - " + filterParameters.category.label;
            }
        
            this.update = function (statisticsData, filterParameters) {
                chartLoading.classList.remove('hidden');
                chartContainer.classList.remove('hidden');
        
                var chartData = statisticsData[dataAttribute];
        
                chartContainer.classList.remove('hidden');
                chartLoading.classList.add('hidden');
        
                var formattedData = formatData(chartData, filterParameters.subCategory.value);
        
                if (self.chart) {
                    self.chart.update(formattedData);
                } else {
                    self.chart = new MixedBarLineChart(formattedData, chart);
                }
            }

            // this.requestUrl = urls.emphasisArea_RollingAverageStatistics;

            // this.updateChartTitle = function(filterParameters) {
            //     chartTitle.innerHTML = "5 Year Rolling Average - " + filterParameters.category.label;
            // }

            // this.update = function(filterParameters) {
            //     chartLoading.classList.remove('hidden');
            //     chartContainer.classList.remove('hidden');

            //     var requestParams = filterParameters.createPayloadRequest();

            //     return esriRequest(self.requestUrl, { query: requestParams }).then(function(response) {
            //         var chartData = response.data.EmphasisAreaData[dataAttribute];

            //         chartContainer.classList.remove('hidden');
            //         chartLoading.classList.add('hidden');

            //         var formattedData = formatData(chartData, filterParameters.category.value);
            //         if (self.chart) {
            //             self.chart.update(formattedData);
            //         } else {
            //             self.chart = new MixedBarLineChart(formattedData, chart);
            //         }
            //     }, Utilities.errorHandler);
            // }
        }

        function formatData(data, categoryLabel) {
            // labels: years
            // y-axis titles: total, serious injury, fatality
            // series: Total(bar), Fatal(line), SI(line)
            var fileName = 'Five_Yr_Rolling_Avg_' + categoryLabel;
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
                },
                noData: {
                    text: "No data to display",
                    align: 'center',
                    verticalAlign: 'middle',
                }
            }
        }

        // return function RollingAverageChart() {
        //     const self = this;
        //     this.requestUrl = urls.emphasisAreaDataURL;
        //     this.update = function (filterParameters) {
        //         RollingAverageChartLoading.classList.remove('hidden');

        //         var requestParams = filterParameters.createPayloadRequest();

        //         return esriRequest(self.requestUrl, { query: requestParams }).then(function (response) {
        //             var chartData = formatTimeData(response.data.TimeData);

        //             RollingAverageChartContainer.classList.remove('hidden');
        //             RollingAverageChartLoading.classList.add('hidden');

        //             if (self.chart) {
        //                 self.chart.update(chartData[0], chartData[1], timeSummaryChart);
        //             } else {
        //                 self.chart = new MixedBarLineChart(chartData[0], chartData[1], timeSummaryChart);
        //             }

        //             RollingAverageChartTitle.innerHTML = "Annual Fatalities and Serious Injuries - " + filterParameters.summary.label;
        //         }, Utilities.errorHandler);
        //     }
        // }


    });