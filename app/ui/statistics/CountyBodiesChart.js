define(
    [
        "./app/components/statistics/StackedColumnChart.js",
        './app/Utilities.js'
    ],
    function(
        StackedColumnChart,
        Utilities
    ) {
        return function CountyBodiesChart() {
            const self = this;
            const dataAttribute = 'county';
            const chart = document.getElementById('CountyBodiesChart');
            const chartContainer = document.getElementById('CountyBodiesChartContainer');
            const chartLoading = document.getElementById('CountyBodiesChartLoading');
            const chartTitle = document.getElementById('CountyBodiesChartTitle');

            this.updateChartTitle = function(filterParameters) {
                chartTitle.innerHTML = "Fatalities & Serious Injuries by County - " + filterParameters.category.label;
            }

            this.clearChart = function() {
                var series = [];
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
                                self.chart = new StackedColumnChart(formattedData, chart);
                            }
                        });
                    } else {
                        Utilities.errorHandler(response.error, response.message);
                    }
                });
            }
        }

        function formatData(data, categoryLabel) {
            // x-axis: County labels
            // series: serious injury, fatality
            var fileName = 'County_Chart_' + categoryLabel;
            var fatality = { name: 'Fatality', data: [] };
            var si = { name: 'Serious Injury', data: [] };
            var countyLabels = [];
        
            data.forEach(element => {
                countyLabels.push(element['County_Label']);
                fatality['data'].push(element['Fatal']);
                si['data'].push(element['Serious_Injury']);
            });
        
            var series = [si, fatality];
        
            return {
                "xaxis": countyLabels,
                "series": series,
                "colors": ['#f7a541', '#f45d4c'],
                "dataLabels": {
                    enabled: true,
                    style: {
                        colors: ["#304758"]
                    }
                },
                "export": {
                    csv: {
                        filename: fileName,
                        columnDelimiter: ',',
                        headerCategory: 'County',
                        dateFormatter(timestamp) {
                            return new Date(timestamp).toDateString()
                        }
                    },
                    svg: {
                        filename: fileName,
                    },
                    png: {
                        filename: fileName,
                    },
                    noData: {
                        text: "Loading data...",
                        align: 'center',
                        verticalAlign: 'middle',
                    }
                }
            }
        }
    });