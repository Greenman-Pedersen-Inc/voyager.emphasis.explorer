define(function () {
    return function BarChart(data, chartColumns, chartContainer) {
        function createChartOptions(yAxisSeries, xAxisCategories) {
            // y axis series format:
            // series: [{
            //     name: 'Total Crashes',
            //     data: [5,6,7,8,9]
            //   }]

            // x axis format: ['Label A', 'Label B', 'Label C' ...]

            var options = {
                chart: {
                    type: 'line',
                    height: "100%",
                },
                series: yAxisSeries,
                xaxis: {
                    categories: xAxisCategories
                },
                yaxis: {
                    Bars: {
                        show: true
                    }
                },
                title: {
                    text: 'Total Crashes by Highest Severity Rating',
                    offsetY: 10,
                    align: 'center',
                    style: {
                        fontFamily: 'system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans","Liberation Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"'
                    }
                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            position: 'top', // top, center, bottom
                        },
                        distributed: true,
                    }
                },
                colors: ['#f45d4c', '#f7a541', '#faca66', '#fee5ad', '#a1dbb2'],
                fill: {
                    type: 'solid'
                },
                legend: {
                    show: false
                },
                dataLabels: {
                    enabled: true,
                    position: 'top',
                    offsetY: -20,
                    style: {
                        colors: ["#304758"]
                    },
                },
                grid: {
                    show: true,
                    yaxis: {
                        Bars: {
                            show: true
                        }
                    },
                    xaxis: {
                        Bars: {
                            show: true
                        }
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
        
        function formatBarChartData(data, chartColumns) {
            var xArray = [];
            var sumArray = new Array(chartColumns.length).fill(0);
            chartColumns.forEach(col => {
                xArray.push(col.title);
            });

            data.forEach(crash => {
                for (var i = 0; i < chartColumns.length; i++) {
                    sumArray[i] += crash[chartColumns[i].data];
                }
            });

            var ySeries = [
                {
                    name: 'Total Crashes',
                    data: sumArray
                }
            ];

            return [ySeries, xArray];
        }

        const self = this;
        var formattedData = formatBarChartData(data, chartColumns);
        var chartOptions = createChartOptions(formattedData[0], formattedData[1]);

        this.chart = new ApexCharts(chartContainer, chartOptions);
        this.update = function (data, chartColumns) {
            var formattedData = formatBarChartData(data, chartColumns);
            var chartOptions = createChartOptions(formattedData[0], formattedData[1]);
            
            self.chart.updateOptions(chartOptions);
        }
        
        this.chart.render();
    }
});