define(
    [
        './app/Utilities.js',
        "./app/components/statistics/BarNegativeChart.js",
    ],
    function(
        Utilities,
        BarNegativeChart,
    ) {
        return function DriverBehaviorBreakdownChart() {
            const self = this;
            const chart = document.getElementById('DriverBehaviorBreakDownChart');
            const chartContainer = document.getElementById('DriverBehaviorBreakDownChartContainer');
            const chartLoading = document.getElementById('DriverBehaviorBreakDownChartLoading');
            const chartTitle = document.getElementById('DriverBehaviorBreakDownChartTitle');

            this.updateChartTitle = function() {
                chartTitle.innerHTML = "Driver Behavior Breakdown";
            }

            this.clearChart = function() {
                var series = [
                    { name: 'Fatality', data: [] },
                    { name: 'Serious Injury', data: [] }
                ];
                if (self.chart) {
                    self.chart.chart.updateSeries(series);
                }
            }

            this.update = function (requestParams, filterParameters, fetchUrl, fetchHeader) {
                chartContainer.classList.remove('hidden');
                chartLoading.classList.remove('hidden');
                self.clearChart();
                let searchParams = new URLSearchParams(requestParams);

                fetch(fetchUrl + searchParams.toString(), fetchHeader).then((response) => {
                    if (response.status === 200) {
                        response.json().then((data) => {
                            let chartData = [];
                            if (data !== undefined) chartData = data[requestParams.category][requestParams.subCategory];

                            chartContainer.classList.remove('hidden');
                            chartLoading.classList.add('hidden');
                    
                            let formattedData = formatData(chartData, filterParameters);
                            if (self.chart) {
                                self.chart.update(formattedData);
                            } else {
                                self.chart = new BarNegativeChart(formattedData, chart);
                            }
                        });
                    } else {
                        Utilities.errorHandler(response.error, response.message);
                    }
                });
            }
        }

        function formatData(data, filterParameters) {
            // x-axis: related behavior labels
            // series: serious injury + fatality
            var fileName = 'Driver_Behavior__Breakdown_' + filterParameters.subCategory.value;

            var series = [
                { name: 'Fatality', data: [] },
                { name: 'Serious Injury', data: [] }
            ];
            var labels = [filterParameters.subCategory.label];

            var siCount = 0;
            var fatalCount = 0;
            data.forEach(dataPoint => {
                if (dataPoint.Year >= filterParameters.getStartYear() && dataPoint.Year <= filterParameters.getEndYear()) {
                    siCount += dataPoint['Serious_Injury'];
                    fatalCount += -1 * (dataPoint['Fatal']);
                }
            });

            series[0].data.push(fatalCount);
            series[1].data.push(siCount);

            return {
                "labels": labels,
                "series": series,
                "colors": ['#f45d4c', '#f7a541'],
                "legend": {
                    show: true,
                    position: 'top',
                    onItemClick: {
                        toggleDataSeries: true
                    },
                    onItemHover: {
                        highlightDataSeries: true
                    },
                },
                "dataLabels": {
                    formatter(val, opts) {
                        var absVal = Math.abs(val);
                        return absVal.toLocaleString("en-US");
                    },
                    enabled: true,
                    style: {
                        colors: ["#304758"]
                    },
                    dropShadow: {
                        enabled: false
                    }
                },
                "tooltip": {
                    shared: false,
                    x: {
                        formatter: function(val) {
                            return val
                        }
                    },
                    y: {
                        formatter: function(val) {
                            var absVal = Math.abs(val);
                            return absVal.toLocaleString("en-US");
                        }
                    }
                },
                "xaxis": {
                    title: {
                        text: 'Person(s)'
                    },
                    labels: {
                        formatter: function(val) {
                            var absVal = Math.abs(val);
                            return absVal.toLocaleString("en-US");
                        }
                    }
                },
                "export": {
                    csv: {
                        filename: fileName,
                        columnDelimiter: ',',
                        headerCategory: 'Driver Behavior',
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
                    text: "Loading data...",
                    align: 'center',
                    verticalAlign: 'middle',
                }
            }
        }


    });