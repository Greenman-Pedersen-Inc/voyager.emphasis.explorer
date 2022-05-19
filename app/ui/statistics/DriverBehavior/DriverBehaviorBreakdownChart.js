define(
    [
        './app/Utilities.js',
        "./app/staticData/urls.js",
        "./app/components/statistics/BarNegativeChart.js",
        "esri/request",
    ],
    function(
        Utilities,
        urls,
        BarNegativeChart,
        esriRequest
    ) {
        const dataAttribute = 'RelatedBehaviorData';
        const chart = document.getElementById('DriverBehaviorBreakDownChart');
        const chartContainer = document.getElementById('DriverBehaviorBreakDownChartContainer');
        const chartLoading = document.getElementById('DriverBehaviorBreakDownChartLoading');
        const chartTitle = document.getElementById('DriverBehaviorBreakDownChartTitle');

        return function DriverBehaviorBreakdownChart() {
            const self = this;
            this.requestUrl = urls.emphasisArea_AnnualStatistics;
            // this.update = function (responseData, filterParameters) {
            //     var chartData = responseData.data.EmphasisAreaData[dataAttribute];
            //     chartLoading.classList.remove('hidden');
            //     chartContainer.classList.remove('hidden');
            //     chartLoading.classList.add('hidden');

            //     var formattedData = formatData(chartData, filterParameters);

            //     if (self.chart) {
            //         self.chart.update(formattedData);
            //     } else {
            //         self.chart = new BarNegativeChart(formattedData, chart);
            //     }
            // }
            this.updateChartTitle = function() {
                chartTitle.innerHTML = "Driver Behavior Breakdown";
            }
            this.update = function(filterParameters) {
                chartLoading.classList.remove('hidden');

                var requestParams = filterParameters.createPayloadRequest();

                return esriRequest(self.requestUrl, { query: requestParams }).then(function(response) {
                    var chartData = response.data.EmphasisAreaData[dataAttribute];
                    chartContainer.classList.remove('hidden');
                    chartLoading.classList.add('hidden');

                    var formattedData = formatData(chartData, filterParameters);

                    if (self.chart) {
                        self.chart.update(formattedData);
                    } else {
                        self.chart = new BarNegativeChart(formattedData, chart);
                    }
                }, Utilities.errorHandler);
            }
        }

        function formatData(data, filterParameters) {
            // x-axis: related behavior labels
            // series: serious injury + fatality
            var fileName = 'Driver_Behavior__Breakdown_' + filterParameters.subCategory.value;

            var series = [
                { name: 'Fatality', data: [] },
                { name: 'Serious Injury', data: [] }
            ];
            // var labels = ['Aggressive', 'Impaired', 'Drowsy/Distracted', 'Unbelted', 'Unlicensed', 'Heavy Vehicle'];
            var labels = [filterParameters.subCategory.label];

            var dataAttributes = [
                'AggressiveData',
                'ImpairedData',
                'DrowsyDistractedData',
                'UnbeltedData',
                'UnlicensedData',
                'HeavyVehicleData'
            ]

            dataAttributes.forEach(attr => {
                if (attr == filterParameters.subCategory.value + "Data") {
                    var siCount = 0;
                    var fatalCount = 0;
                    if (data[attr].length > 0) {
                        data[attr].forEach(yearData => {
                            if (yearData.Year >= filterParameters.getStartYear() && yearData.Year <= filterParameters.getEndYear()) {
                                siCount += yearData['Serious_Injury'];
                                fatalCount += -1 * (yearData['Fatal']);
                            }
                        });
                        series[0].data.push(fatalCount);
                        series[1].data.push(siCount);
                    }
                }
            });

            return {
                "labels": labels,
                "series": series,
                "colors": ['#f45d4c', '#f7a541'],
                "legend": {
                    show: true,
                    position: 'top',
                    onItemClick: {
                        toggleDataSeries: true
                    },
                    onItemHover: {
                        highlightDataSeries: true
                    },
                },
                "dataLabels": {
                    formatter(val, opts) {
                        var absVal = Math.abs(val);
                        return absVal.toLocaleString("en-US");
                    },
                    enabled: true,
                    style: {
                        colors: ["#304758"]
                    },
                    dropShadow: {
                        enabled: false
                    }
                },
                "tooltip": {
                    shared: false,
                    x: {
                        formatter: function(val) {
                            return val
                        }
                    },
                    y: {
                        formatter: function(val) {
                            var absVal = Math.abs(val);
                            return absVal.toLocaleString("en-US");
                        }
                    }
                },
                "xaxis": {
                    title: {
                        text: 'Person(s)'
                    },
                    labels: {
                        formatter: function(val) {
                            var absVal = Math.abs(val);
                            return absVal.toLocaleString("en-US");
                        }
                    }
                },
                "export": {
                    csv: {
                        filename: fileName,
                        columnDelimiter: ',',
                        headerCategory: 'Driver Behavior',
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