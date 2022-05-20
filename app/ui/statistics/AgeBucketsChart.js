define(
    [
        "./app/components/statistics/ColumnChart.js",
    ],
    function(
        ColumnChart,
    ) {
        return function AgeBucketChart() {
            const self = this;
            const dataAttribute = 'age';
            const chart = document.getElementById('AgeBucketsChart');
            const chartContainer = document.getElementById('AgeBucketsChartContainer');
            const chartLoading = document.getElementById('AgeBucketsChartLoading');
            const chartTitle = document.getElementById('AgeBucketsChartTitle');

            this.updateChartTitle = function (filterParameters) {
                chartTitle.innerHTML = "Total Persons Count by Age and Gender - " + filterParameters.category.label;
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
                    self.chart = new ColumnChart(formattedData, chart);
                }
            }
        }

        function formatData(data, categoryLabel) {
            // labels: years
            // y-axis titles: total, serious injury, fatality
            // series: Total(bar), Fatal(line), SI(line)
            var fileName = 'Age_Gender_Chart_' + categoryLabel;
            const labelPosition = {
                "< 16": 0,
                "16-20": 1,
                "21-25": 2,
                "26-30": 3,
                "31-35": 4,
                "36-40": 5,
                "41-45": 6,
                "46-50": 7,
                "51-55": 8,
                "56-60": 9,
                "61-65": 10,
                "> 65": 11,
                "N/A": 12
            }
        
            var dataHolder = {
                'Fatal': {
                    'Male': [],
                    'Female': []
                },
                'Serious_Injury': {
                    'Male': [],
                    'Female': []
                }
            }
            var yaxis = [{
                title: {
                    text: 'Total Persons Count',
                },
                labels: {
                    formatter: function (val) {
                        if (val) {
                            return val.toLocaleString("en-US");
                        } else { return 0; }
                    }
                }
            },];
        
            data.forEach(element => {
                var labelPos = labelPosition[element["AgeBucket"]];
                var data = {
                    "order": labelPos,
                    "count": element['Persons_Count']
                }
                if (element['Severity_Rating'] === "4") {
                    if (element['Sex'] === "F") {
                        dataHolder['Serious_Injury']['Female'].push(data);
                    } else {
                        dataHolder['Serious_Injury']['Male'].push(data);
                    }
                } else {
                    if (element['Sex'] === "F") {
                        dataHolder['Fatal']['Female'].push(data);
                    } else {
                        dataHolder['Fatal']['Male'].push(data);
                    }
                }
            });
        
            dataHolder['Serious_Injury']['Female'] = dataHolder['Serious_Injury']['Female'].sort((a, b) => a.order - b.order);
        
            var series = [
                { name: 'Female SI', data: Object.values(ConvertResultsToArray(dataHolder['Serious_Injury']['Female'], 'count')) },
                { name: 'Female Fatality', data: Object.values(ConvertResultsToArray(dataHolder['Fatal']['Female'], 'count')) },
                { name: 'Male SI', data: Object.values(ConvertResultsToArray(dataHolder['Serious_Injury']['Male'], 'count')) },
                { name: 'Male Fatality', data: Object.values(ConvertResultsToArray(dataHolder['Fatal']['Male'], 'count')) },
            ];
        
            return {
                "yaxis": yaxis,
                "series": series,
                "labels": { categories: Object.keys(labelPosition) },
                "datalabels": {
                    offsetY: -20,
                    style: {
                        fontSize: '12px',
                        colors: ["#304758"]
                    }
                },
                "colors": ['#9189d4', '#384183', '#f7a541', '#f45d4c'],
                "stroke": {
                    show: true,
                    width: 2,
                    colors: ['transparent']
                },
                "plotOptions": {
                    bar: {
                        horizontal: false,
                        dataLabels: {
                            position: 'top', // top, center, bottom
                        }
                    }
                },
                "export": {
                    csv: {
                        filename: fileName,
                        columnDelimiter: ',',
                        headerCategory: 'Age Bucket',
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
        
        function ConvertResultsToArray(objectArray, valueWord) {
            var returnArray = [];
            objectArray.forEach(element => {
                returnArray.push(element[valueWord]);
            });
            return returnArray;
        }
    });