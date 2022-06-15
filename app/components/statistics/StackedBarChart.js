define(function () {
    return function StackedColumnChart(yAxisSeries, xAxisCategories, chartContainer) {
        function createChartOptions(yAxisSeries, xAxisCategories) {
            // y axis series format:
            // series: [{
            //     name: 'Total Crashes',
            //     data: [5,6,7,8,9]
            //   }]

            // x axis format: ['Label A', 'Label B', 'Label C' ...]

            var options = {
                chart: {
                    type: 'bar',
                    height: '350rem',
                    width: '100%',
                    stacked: true,
                    offsetY: 10,
                    toolbar: {
                        offsetX: -5
                    },
                },
                series: yAxisSeries,
                xaxis: {
                    categories: xAxisCategories
                },
                yaxis: {
                    show: true
                },
                colors: ['#f45d4c', '#f7a541', '#faca66', '#fee5ad', '#a1dbb2'],
                fill: {
                    type: 'solid'
                },
                legend: {
                    position: 'bottom',
                },
                dataLabels: {
                    enabled: true,
                    style: {
                        colors: ["#304758"]
                    },
                    formatter: function(value, { seriesIndex, dataPointIndex, w }) {
                        // return (value).toFixed(0) + '% (' + w.globals.series[seriesIndex][dataPointIndex] + ')'
                        return (w.globals.series[seriesIndex][dataPointIndex])
                    }
                },
                noData: {
                    text: "Loading data...",
                    align: 'center',
                    verticalAlign: 'middle',
                }
            }

            return options;
        }

        const self = this;
        var chartOptions = createChartOptions(yAxisSeries, xAxisCategories);
        this.chart = new ApexCharts(chartContainer, chartOptions);
        this.chart.render();

        this.update = function (yAxisSeries, xAxisCategories) {
            var chartOptions = createChartOptions(yAxisSeries, xAxisCategories);
            self.chart.updateOptions(chartOptions, true, true);
        }

    }
});