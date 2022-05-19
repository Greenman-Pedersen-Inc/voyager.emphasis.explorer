define(
    [
        './app/Utilities.js',
        "./app/staticData/urls.js",
        "./app/components/statistics/StackedColumnChart.js",
        "esri/request",
    ],
    function(
        Utilities,
        urls,
        StackedColumnChart,
        esriRequest
    ) {
        const dataAttribute = 'CountyStatisticsData';
        const chart = document.getElementById('CountyBodiesChart');
        const chartContainer = document.getElementById('CountyBodiesChartContainer');
        const chartLoading = document.getElementById('CountyBodiesChartLoading');
        const chartTitle = document.getElementById('CountyBodiesChartTitle');

        return function CountyBodiesChart() {
            const self = this;
            this.requestUrl = urls.emphasisArea_CountyStatistics;
            this.updateChartTitle = function(filterParameters) {
                chartTitle.innerHTML = "Fatalities & Serious Injuries by County - " + filterParameters.category.label;
            }
            this.update = function(filterParameters) {
                chartLoading.classList.remove('hidden');
                chartContainer.classList.remove('hidden');

                var requestParams = filterParameters.createPayloadRequest();

                return esriRequest(self.requestUrl, { query: requestParams }).then(function(response) {
                    var chartData = response.data.EmphasisAreaData[dataAttribute];

                    chartContainer.classList.remove('hidden');
                    chartLoading.classList.add('hidden');

                    var formattedData = formatData(chartData, filterParameters.category.value);

                    if (self.chart) {
                        self.chart.update(formattedData);
                    } else {
                        self.chart = new StackedColumnChart(formattedData, chart);
                    }
                }, Utilities.errorHandler);
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
                    }
                }
            }
        }
    });