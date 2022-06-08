define(
    [
        "./app/components/statistics/MixedBarLineChart.js",
        './app/Utilities.js',
    ],
    function(
        MixedBarLineChart,
        Utilities
    ) {
        return function AnnualBodiesChart() {
            const self = this;
            const dataAttribute = 'annual_bodies';
            const chart = document.getElementById('AnnualBodiesChart');
            const chartContainer = document.getElementById('AnnualBodiesChartContainer');
            const chartLoading = document.getElementById('AnnualBodiesChartLoading');
            const chartTitle = document.getElementById('AnnualBodiesChartTitle');

            this.updateChartTitle = function(filterParameters) {
                chartTitle.innerHTML = "Annual Fatalities and Serious Injuries - " + filterParameters.category.label;
            }

            this.clearChart = function() {
                var series = [
                    { name: 'Serious Injury', type: 'column', data: []},
                    { name: 'Fatality', type: 'line', data: []}
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
                    }
                });
            }
        }

        function formatData(data, categoryLabel) {
            // labels: years
            // y-axis titles: serious injury, fatality
            // series: Serious_Injury(bar), Fatal(line)
            let fileName = 'Annual_Bodies_' + categoryLabel;
            let labels = [];
            let dataHolder = {
                'Serious_Injury': [],
                'Fatal': []
            }
            let yaxis = [{
                    title: {
                        text: 'Serious Injury',
                    },
                    labels: {
                        formatter: function(val) {
                            return val.toLocaleString("en-US");
                        }
                    }
                },
                {
                    opposite: true,
                    title: {
                        text: 'Fatality'
                    },
                    labels: {
                        formatter: function(val) {
                            return val.toLocaleString("en-US");
                        }
                    }
                }
            ];

            data.forEach(element => {
                labels.push(element['Year'].toString());
                dataHolder['Serious_Injury'].push(element['Serious_Injury']);
                dataHolder['Fatal'].push(element['Fatal']);
            });

            let series = [
                { name: 'Serious Injury', type: 'column', data: Object.values(dataHolder['Serious_Injury']) },
                { name: 'Fatality', type: 'line', data: Object.values(dataHolder['Fatal']) }
            ];

            return {
                "yaxis": yaxis,
                "series": series,
                "labels": labels,
                "datalabels": {
                    enabled: true,
                    enabledOnSeries: [1]
                },
                "colors": ['#f7a541', '#f45d4c'],
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