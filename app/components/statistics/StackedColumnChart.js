define(function () {
    return function StackedColumnChart(data, chartContainer) {
        function createChartOptions(data) {
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
                    toolbar: {
                        show: true
                    }
                },
                series: data['series'],
                xaxis: {
                    categories: data['xaxis']
                },
                yaxis: {
                    show: false
                },
                colors: data['colors'],
                fill: {
                    type: 'solid'
                },
                legend: {
                    position: 'bottom',
                },
                dataLabels: data['dataLabels'],
                noData: {
                    text: "No data to display",
                    align: 'center',
                    verticalAlign: 'middle',
                }
            }
            if (data['export']) options.chart.toolbar.export = data['export']; 
            return options;
        }

        const self = this;
        var chartOptions = createChartOptions(data);

        this.chart = new ApexCharts(chartContainer, chartOptions);
        this.update = function (data) {
            var chartOptions = createChartOptions(data);
            self.chart.updateOptions(chartOptions);
        }
        
        this.chart.render();
    }
});