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
        const dataAttribute = 'RelatedBehaviorData';
        const chart = document.getElementById('RelatedBehaviorChart');
        const chartContainer = document.getElementById('RelatedBehaviorChartContainer');
        const chartLoading = document.getElementById('RelatedBehaviorChartLoading');
        const chartTitle = document.getElementById('RelatedBehaviorChartTitle');

        return function RelatedBehaviorChart() {
            const self = this;
            this.requestUrl = urls.emphasisArea_RelatedBehaviorStatistics;
            this.updateChartTitle = function(filterParameters) {
                chartTitle.innerHTML = "Related Behavior Breakdown - " + filterParameters.category.label;
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
            var fileName = 'Related_Behavior_Chart_' + categoryLabel;

            var series = [];
            var labels = ['Aggressive', 'Impaired', 'Drowsy/Distracted', 'Unbelted', 'Unlicensed'];
            var dataAttributes = [
                'AggressiveData',
                'ImpairedData',
                'DrowsyDistractedData',
                'UnbeltedData',
                'UnlicensedData'
            ]

            dataAttributes.forEach(attr => {
                if (data[attr].length > 0) {
                    series.push(data[attr][0]['Serious_Injury']);
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
                }
            }
        }


    });