define(
    [
        "./app/components/statistics/MixedBarLineChart.js",
    ],
    function(
        MixedBarLineChart,
    ) {
        return function AnnualBodiesChart() {
            const self = this;
            const dataAttribute = 'annual_bodies';
            const chart = document.getElementById('AnnualBodiesChart');
            const chartContainer = document.getElementById('AnnualBodiesChartContainer');
            const chartLoading = document.getElementById('AnnualBodiesChartLoading');
            const chartTitle = document.getElementById('AnnualBodiesChartTitle');

            this.updateChartTitle = function(filterParameters) {
                chartTitle.innerHTML = "Annual Fatalities and Serious Injuries - " + filterParameters.category.label;
            }

            this.update = function (statisticsData, filterParameters) {
                chartLoading.classList.remove('hidden');
                chartContainer.classList.remove('hidden');
        
                var chartData = statisticsData[dataAttribute];
        
                chartContainer.classList.remove('hidden');
                chartLoading.classList.add('hidden');
        
                var formattedData = formatData(chartData, filterParameters.category.value);
                if (self.chart) {
                    self.chart.update(formattedData);
                } else {
                    self.chart = new MixedBarLineChart(formattedData, chart);
                }
            }
        }

        function formatData(data, categoryLabel) {
            // labels: years
            // y-axis titles: serious injury, fatality
            // series: Serious_Injury(bar), Fatal(line)
            var fileName = 'Annual_Bodies_' + categoryLabel;
            var labels = [];
            var dataHolder = {
                'Serious_Injury': [],
                'Fatal': []
            }
            var yaxis = [{
                    title: {
                        text: 'Serious Injury',
                    },
                    labels: {
                        formatter: function(val) {
                            return val.toLocaleString("en-US");
                        }
                    }
                },
                {
                    opposite: true,
                    title: {
                        text: 'Fatality'
                    },
                    labels: {
                        formatter: function(val) {
                            return val.toLocaleString("en-US");
                        }
                    }
                }
            ];

            data.forEach(element => {
                labels.push(element['Year'].toString());
                dataHolder['Serious_Injury'].push(element['Serious_Injury']);
                dataHolder['Fatal'].push(element['Fatal']);
            });

            var series = [
                { name: 'Serious Injury', type: 'column', data: Object.values(dataHolder['Serious_Injury']) },
                { name: 'Fatality', type: 'line', data: Object.values(dataHolder['Fatal']) }
            ];

            return {
                "yaxis": yaxis,
                "series": series,
                "labels": labels,
                "datalabels": {
                    enabled: true,
                    enabledOnSeries: [1]
                },
                "colors": ['#f7a541', '#f45d4c'],
                "stroke": { width: [0, 4, 4] },
                "export": {
                    csv: {
                        filename: fileName,
                        columnDelimiter: ',',
                        headerCategory: 'Year',
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
                },
                noData: {
                    text: "No data to display",
                    align: 'center',
                    verticalAlign: 'middle',
                }
            }
        }

    });