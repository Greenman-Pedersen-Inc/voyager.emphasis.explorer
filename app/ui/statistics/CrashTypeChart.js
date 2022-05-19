define(
    [
        './app/Utilities.js',
        "./app/staticData/urls.js",
        "./app/components/statistics/PieChart.js",
        "esri/request",
    ],
    function(
        Utilities,
        urls,
        PieChart,
        esriRequest
    ) {
        const dataAttribute = 'CrashTypeData';
        const chart = document.getElementById('CrashTypeChart');
        const chartContainer = document.getElementById('CrashTypeChartContainer');
        const chartLoading = document.getElementById('CrashTypeChartLoading');
        const chartTitle = document.getElementById('CrashTypeChartTitle');

        return function CrashTypeChart() {
            const self = this;
            this.requestUrl = urls.emphasisArea_CrashTypeStatistics;

            this.updateChartTitle = function(filterParameters) {
                chartTitle.innerHTML = "Crash Type Breakdown (Top 6 Categories) - " + filterParameters.category.label;
            }

            this.update = function(filterParameters) {
                chartLoading.classList.remove('hidden');
                chartContainer.classList.remove('hidden');

                var requestParams = filterParameters.createPayloadRequest();

                return esriRequest(self.requestUrl, { query: requestParams }).then(function(response) {
                    var chartData = response.data.EmphasisAreaData[dataAttribute];

                    chartContainer.classList.remove('hidden');
                    chartLoading.classList.add('hidden');

                    var formattedData = formatData(chartData, filterParameters.category.value);

                    if (self.chart) {
                        self.chart.update(formattedData);
                    } else {
                        self.chart = new PieChart(formattedData, chart);
                    }
                }, Utilities.errorHandler);
            }
        }

        function formatData(data, categoryLabel) {
            // x-axis: related behavior labels
            // series: serious injury + fatality
            var fileName = 'Crash_Type_Chart_' + categoryLabel;
            var series = [];
            var labels = [];

            if (data.length <= 6) {
                data.forEach(element => {
                    labels.push(element['Crash_Type_Label']);
                    series.push(element['Serious_Injury'] + element['Fatal']);
                });
            } else {
                for (var i = 0; i < 6; i++) {
                    labels.push(data[i]['Crash_Type_Label']);
                    series.push(data[i]['Serious_Injury'] + data[i]['Fatal']);
                }
            }

            return {
                "labels": labels,
                "series": series,
                "colors": ['#f45d4c', '#f7a541', '#faca66', '#fee5ad', '#a1dbb2', '#b9f8cc'],
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
                    // formatter(val, opts) {
                    //     const name = opts.w.globals.labels[opts.seriesIndex]
                    //     return [name, val.toFixed(1) + '%']
                    // },
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
                        headerCategory: 'Crash Type',
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
                }
            }
        }

    });