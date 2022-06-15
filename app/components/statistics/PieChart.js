define(function () {
    return function PieChart(data, chartContainer) {
        function CreateChartOptions(data) {
            // y axis series format:
            // series: [{
            //     name: 'Total Crashes',
            //     data: [5,6,7,8,9]
            //   }]

            // x axis format: ['Label A', 'Label B', 'Label C' ...]

            var options = {
                chart: {
                    type: 'pie',
                    width: "100%",
                    height: "375rem",
                    toolbar: {
                        show: true,
                        tools: {
                            download: true
                        },
                    }
                },
                series: data["series"],
                labels: data["labels"],
                colors: data["colors"],
                fill: {
                    type: 'solid'
                },
                legend: data["legend"],
                dataLabels: data["dataLabels"],
                noData: {
                    text: "Loading data...",
                    align: 'center',
                    verticalAlign: 'middle',
                }
            }

            if (data["title"]) {
                options.title = {
                    text: data["title"],
                    align: 'center',
                    offsetY: 10,
                    style: {
                        fontFamily: 'system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans","Liberation Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"'
                    }
                }
            }
            if (data['export']) options.chart.toolbar.export = data['export']; 
            return options;
        }

        const self = this;
        var chartOptions = CreateChartOptions(data);

        this.chart = new ApexCharts(chartContainer, chartOptions);
        this.update = function (data) {
            var chartOptions = CreateChartOptions(data);
            self.chart.updateOptions(chartOptions);
        }
        
        this.chart.render();
    }
});