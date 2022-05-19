define(function () {
    return function BarNegativeChart(data, chartContainer) {
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
                    height: "250rem",
                    offsetY: 5,
                    stacked: true,
                    toolbar: {
                        show: true
                    }
                },
                plotOptions: {
                    bar: {
                      horizontal: true,
                      barHeight: '80%',
                    },
                },
                series: data['series'],
                labels: data['labels'],
                xaxis: data['xaxis'],
                // yaxis: data['yaxis'],
                dataLabels: data['dataLabels'],
                tooltip: data['tooltip'],
                // stroke: data['stroke'],
                colors: data['colors'],
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