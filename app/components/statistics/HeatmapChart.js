define(function () {
    return function HeatmapChart(data, chartColumns, chartSeries, chartContainer) {
        function createChartOptions(yAxisSeries, colorRange) {
            var options = {
                chart: {
                    type: 'heatmap',
                    height: '350rem',
                    width: "100%",
                    offsetX: 10,
                    offsetY: 10
                },
                plotOptions: {
                    heatmap: {
                        shadeIntensity: .5,
                        colorScale: {
                            ranges: colorRange
                          }
                    }
                },
                colors: ['#f45d4c', '#f7a541', '#faca66', '#fee5ad', '#a1dbb2'],
                series: yAxisSeries,
                noData: {
                    text: "No data to display",
                    align: 'center',
                    verticalAlign: 'middle',
                },
                legend: {
                    position: 'top',
                },
                dataLabels: {
                    enabled: true,
                    style: {
                        colors: ["#304758"]
                    }
                },
            }

            return options;
        }
        function formatChartData(data, chartSeries, chartColumns) {
            var yData = {};
            var ySeries = [];

            chartSeries.forEach(series => {
                yData[series.data] = {
                    name: series.title,
                    data: []
                };
            });

            chartSeries.forEach(series => {
                chartColumns.forEach(column => {
                    var dataObj = data.find(x => x.Label === column & x.SubLabel === series.data);
                    var dataPoint = {
                        x: column,
                        y: 0
                    }
                    if (dataObj) {
                        dataPoint.y = dataObj['Crash_Count'];
                    }
                    yData[series.data].data.push(dataPoint);
                });
            });

            chartSeries.forEach(series => {
                ySeries.push(yData[series.data]);
            });

            return [ySeries];
        }

        function formatColorShade(data) {
            var colorRange = [];
            var colorArray = ['#a1dbb2', '#fee5ad', '#faca66', '#f7a541', '#f45d4c'];
            var crashCountArray = data.map(x => x['Crash_Count']);
            var min = Math.min.apply(null, crashCountArray);
            var max = Math.max.apply(null, crashCountArray);
            var difference = max - min;

            var lowerBound = 0;
            if (difference > colorArray.length) {
                var bucketSize = Math.floor(difference / colorArray.length);
                for (var i = 0; i < colorArray.length; i++) {
                    if (i == colorArray.length - 1) {
                        colorRange.push({
                            from: lowerBound,
                            to: max,
                            color: colorArray[i],
                        });
                    }
                    else {
                        colorRange.push({
                            from: lowerBound,
                            to: lowerBound + bucketSize,
                            color: colorArray[i],
                        });
                        lowerBound = lowerBound + bucketSize + 1;
                    }
                }
            }
            else if (difference <= 1) {
                colorRange.push({
                    from: 0,
                    to: max,
                    color: '#f45d4c',
                });
            }
            else {
                for (var i=0; i < max-1; i++){ 
                    colorRange.push({
                        from: i + 1,
                        to: i + 2,
                        color: colorArray[i],
                    });
                }
            }
            return colorRange;
        }

        const self = this;
        var formattedData = formatChartData(data, chartSeries, chartColumns);
        var colorRange = formatColorShade(data);
        var chartOptions = createChartOptions(formattedData[0], colorRange);

        this.chart = new ApexCharts(chartContainer, chartOptions);

        this.update = function (data, chartSeries, chartColumns) {
            var formattedData = formatChartData(data, chartSeries, chartColumns);
            var colorRange = formatColorShade(data);
            var chartOptions = createChartOptions(formattedData[0], colorRange);
            
            self.chart.updateOptions(chartOptions);
        }
        
        this.chart.render();
    }
});