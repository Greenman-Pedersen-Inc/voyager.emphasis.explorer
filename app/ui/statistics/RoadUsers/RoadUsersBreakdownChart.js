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

        return function RoadUsersBreakdownChart() {
            const self = this;
            const dataAttribute = 'road_users';
            const chart = document.getElementById('RoadUsersBreakDownChart');
            const chartContainer = document.getElementById('RoadUsersBreakDownChartContainer');
            const chartLoading = document.getElementById('RoadUsersBreakDownChartLoading');
            const chartTitle = document.getElementById('RoadUsersBreakDownChartTitle');
            
            this.updateChartTitle = function() {
                chartTitle.innerHTML = "Road Users Breakdown";
            }
            this.update = function (statisticsData, filterParameters) {
                chartLoading.classList.remove('hidden');
                chartContainer.classList.remove('hidden');
        
                const chartData = statisticsData[filterParameters.subCategory.value];
                
                chartContainer.classList.remove('hidden');
                chartLoading.classList.add('hidden');
        
                var formattedData = formatData(chartData, filterParameters);
        
                if (self.chart) {
                    self.chart.update(formattedData);
                } else {
                    self.chart = new BarNegativeChart(formattedData, chart);
                }
            }
        }

        function formatData(data, filterParameters) {
            // x-axis: related behavior labels
            // series: serious injury + fatality
            var fileName = 'Road_Users_Breakdown_' + filterParameters.subCategory.value;

            var series = [
                { name: 'Fatality', data: [] },
                { name: 'Serious Injury', data: [] }
            ];
            var labels = [filterParameters.subCategory.label];

            var siCount = 0;
            var fatalCount = 0;
            data.forEach(dataPoint => {
                if (dataPoint.Year >= filterParameters.getStartYear() && dataPoint.Year <= filterParameters.getEndYear()) {
                    siCount += dataPoint['Serious_Injury'];
                    fatalCount += -1 * (dataPoint['Fatal']);
                }
            });

            series[0].data.push(fatalCount);
            series[1].data.push(siCount);

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
                        headerCategory: 'Road User',
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