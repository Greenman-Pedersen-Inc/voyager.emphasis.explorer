define(function () {
    return function ColumnChart(data, chartContainer) {
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
                    height: "400rem",
                    toolbar: {
                        show: true
                    }
                },
                plotOptions: data['plotOptions'],
                fill: {
                    opacity: 1
                },
                series: data['series'],
                xaxis: data['labels'],
                yaxis: data['yaxis'],
                dataLabels: data['datalabels'],
                stroke: data['stroke'],
                legend: {
                    position: 'bottom',
                },
                colors: data['colors'],
                noData: {
                    text: "Loading data...",
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
        this.chart.render();

        this.update = function (data) {
            var chartOptions = createChartOptions(data);
            self.chart.updateOptions(chartOptions);
        }
        
    }
});