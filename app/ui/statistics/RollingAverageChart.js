define(
    [
        './app/Utilities.js',
        "./app/components/statistics/MixedBarLineChart.js",
    ],
    function(
        Utilities,
        MixedBarLineChart,
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
        
            this.clearChart = function() {
                var series = [
                    { name: 'Total Injuries', type: 'column', data: [] },
                    { name: 'Serious Injury', type: 'line', data: [] },
                    { name: 'Fatality', type: 'line', data: [] }
                ];
                if (self.chart) {
                    self.chart.chart.updateSeries(series);
                }
            }
            
            this.update = function (requestParams, filterParameters, fetchUrl, fetchHeader) {
                chartLoading.classList.remove('hidden');
                chartContainer.classList.remove('hidden');
                self.clearChart();
        
                requestParams["chartType"] = dataAttribute;
                let searchParams = new URLSearchParams(requestParams);
                
                fetch(fetchUrl + searchParams.toString(), fetchHeader).then((response) => {
                    if (response.status === 200) {
                        response.json().then((data) => {
                            let chartData = [];
                            if (data !== undefined) chartData = data[requestParams.category][dataAttribute];

                            chartContainer.classList.remove('hidden');
                            chartLoading.classList.add('hidden');
                    
                            let formattedData = formatData(chartData, filterParameters.category.value);
                            if (self.chart) {
                                self.chart.update(formattedData);
                            } else {
                                self.chart = new MixedBarLineChart(formattedData, chart);
                            }
                        });
                    } else {
                        Utilities.errorHandler(response.error, response.message);
                        chartContainer.classList.remove('hidden');
                        chartLoading.classList.add('hidden');
                    }
                });
            }
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
                    text: "Loading data...",
                    align: 'center',
                    verticalAlign: 'middle',
                }
            }
        }
    });