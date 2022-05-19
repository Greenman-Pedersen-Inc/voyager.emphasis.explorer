define(function () {
    return function LineChart(yAxisSeries, xAxisCategories, chartContainer) {
        var self = this;
        
        function createChartOptions(yAxisSeries, xAxisCategories) {
            var options = {
                chart: {
                    type: 'line',
                    height: '350rem',
                },
                series: [{
                    name: 'sales',
                    data: yAxisSeries
                }],
                xaxis: {
                    categories: xAxisCategories
                },
                dataLabels: {
                    enabled: true
                },
                grid: {
                    show: true,
                    yaxis: {
                        lines: {
                            show: true
                        }
                    },
                    xaxis: {
                        lines: {
                            show: true
                        }
                    }
                },
                colors: ['#f45d4c'],
                noData: {
                    text: "No data to display",
                    align: 'center',
                    verticalAlign: 'middle',
                }
            }

            options.series = yAxisSeries;
            options.xaxis.categories = xAxisCategories;

            return options;
        }
        
        var chartOptions = createChartOptions(yAxisSeries, xAxisCategories);
        this.chart = new ApexCharts(chartContainer, chartOptions);   

        this.update = function (yAxisSeries, xAxisCategories) {
            var chartOptions = createChartOptions(yAxisSeries, xAxisCategories);
            self.chart.updateOptions(chartOptions);
        }

        this.chart.render();
    }
});