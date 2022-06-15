define(
    [
        "./app/components/statistics/PieChart.js",
    ],
    function (
        PieChart,
    ) {
        return function RelatedBehaviorChart() {
            const self = this;
            const dataAttribute = 'related_behavior';
            const chart = document.getElementById('RelatedBehaviorChart');
            const chartContainer = document.getElementById('RelatedBehaviorChartContainer');
            const chartLoading = document.getElementById('RelatedBehaviorChartLoading');
            const chartTitle = document.getElementById('RelatedBehaviorChartTitle');

            this.updateChartTitle = function (filterParameters) {
                chartTitle.innerHTML = "Related Behavior Breakdown - " + filterParameters.category.label;
            }

            this.clearChart = function() {
                var series = [];
                if (self.chart) {
                    self.chart.chart.updateSeries(series);
                }
            }

            this.update = function (requestParams, filterParameters, fetchUrl, fetchHeader) {
                chartLoading.classList.remove('hidden');
                chartContainer.classList.remove('hidden');
                self.clearChart();
                requestParams["chartType"] = dataAttribute;
                let searchParams = new URLSearchParams(requestParams);

                fetch(fetchUrl + searchParams.toString(), fetchHeader).then((response) => {
                    if (response.status === 200) {
                        response.json().then((data) => {
                            let chartData = [];
                            if (data !== undefined) chartData = data[requestParams.category];

                            chartContainer.classList.remove('hidden');
                            chartLoading.classList.add('hidden');
                    
                            let formattedData = formatData(chartData, filterParameters.category.value);
                            if (self.chart) {
                                self.chart.update(formattedData);
                            } else {
                                self.chart = new PieChart(formattedData, chart);
                            }
                        });
                    } else {
                        Utilities.errorHandler(response.error, response.message);
                    }
                });
            }
        }

        function formatData(data, categoryLabel) {
            // x-axis: related behavior labels
            // series: serious injury + fatality
            var fileName = 'Related_Behavior_Chart_' + categoryLabel;

            var series = [];
            var labels = ['Aggressive', 'Impaired', 'Drowsy/Distracted', 'Unbelted', 'Unlicensed'];
            var dataAttributes = [
                'aggressive',
                'impaired',
                'drowsy_distracted',
                'unbelted',
                'unlicensed'
            ]

            dataAttributes.forEach(attr => {
                if (data[attr].length > 0) {
                    series.push(data[attr][0]['Total']);
                } else { series.push(0); }
            });

            return {
                "labels": labels,
                "series": series,
                "colors": ['#f45d4c', '#f7a541', '#faca66', '#fee5ad', '#a1dbb2'],
                "legend": {
                    show: true,
                    position: 'bottom',
                    onItemClick: {
                        toggleDataSeries: true
                    },
                    onItemHover: {
                        highlightDataSeries: true
                    },
                },
                "dataLabels": {
                    enabled: true,
                    style: {
                        colors: ["#304758"]
                    },
                    dropShadow: {
                        enabled: false
                    }
                },
                "export": {
                    csv: {
                        filename: fileName,
                        columnDelimiter: ',',
                        headerCategory: 'Behavior',
                        headerValue: 'Persons Count',
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
                    text: "Loading data...",
                    align: 'center',
                    verticalAlign: 'middle',
                }
            }
        }
    });