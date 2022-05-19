define(
    [
        './app/Utilities.js',
        "./app/staticData/urls.js",
        "./app/components/statistics/DataTable.js",
        "./app/components/statistics/StackedBarChart.js",
        "esri/request",
    ],
    function(
        Utilities,
        urls,
        DataTable,
        StackedBarChart,
        esriRequest
    ) {

        return function FatalSriTable(map, mapFilter) {
            const self = this;
            const fatalSriTableContainer = document.getElementById('FatalSriTableContainer');
            const fatalSriTableChart = document.getElementById('FatalSriTableChart');
            const fatalSriTable = document.getElementById('FatalSriTable');
            const fatalSriTableLoading = document.getElementById('FatalSriTableLoading');
            const fatalSriTableMap = document.getElementById('FatalSriTableMap');
            const fatalSriTableTitleDiv = document.getElementById('FatalSriTableTitle');

            this.requestUrl = urls.fatalSriURL;
            this.CardTitle = 'Top 25 SRI by Fatal & Incapacitated Crashes';
            this.attribute = 'FatalSriData';
            this.columns = [
                { data: "Sri", visible: false },
                { data: "Milepost", visible: false },
                { data: "Sri_Name", title: "SRI" },
                { data: "Mp_Range", visible: true, title: "Milepost" },
                { data: "Fatal_Count", title: "Fatal" },
                { data: "Incap_Count", title: "Incap." },
            ];

            function formatTimeData(timeData) {
                // labels will be the hours between 5AM and 8PM. Data will be crash count
                var labels = [];
                var fatalData = {};
                var incapData = {};

                for (var t = 5; t <= 20; t++) {
                    fatalData[t] = 0;
                    incapData[t] = 0;

                    var labelFormatted = t + " AM";
                    if (t == 12) { labelFormatted = t + " PM"; } else if (t > 12) {
                        labelFormatted = (t - 12) + " PM";
                    }
                    labels.push(labelFormatted);
                }

                for (var i = 0; i < timeData.length; i++) {
                    if (timeData[i].Hour >= 5 && timeData[i].Hour <= 20) {
                        fatalData[timeData[i].Hour] += timeData[i].Fatal_Count;
                        incapData[timeData[i].Hour] += timeData[i].Incap_Count;
                    }
                }

                var ySeries = [{
                        name: 'Fatal Crashes',
                        data: Object.values(fatalData)
                    },
                    {
                        name: 'Incapacitated Crashes',
                        data: Object.values(incapData)
                    }
                ];
                return [ySeries, labels];
            }


            this.update = function(filterParameters) {
                fatalSriTableLoading.classList.remove('hidden');
                var requestParams = filterParameters.createPayloadRequest();

                return esriRequest(self.requestUrl, { query: requestParams }).then(function(response) {
                    console.log(response.data);
                    fatalSriTableLoading.classList.add('hidden');
                    fatalSriTableContainer.classList.remove('hidden');

                    var chartData = formatTimeData(response.data[self.attribute]);

                    if (self.table) {
                        self.table.update(response.data[self.attribute], self.columns)
                    } else {
                        self.table = new DataTable(response.data[self.attribute], self.columns, fatalSriTable, fatalSriTableMap, map, mapFilter);
                    }

                    if (self.chart) {
                        self.chart.update(chartData[0], chartData[1], fatalSriTableChart);
                    } else {
                        self.chart = new StackedBarChart(chartData[0], chartData[1], fatalSriTableChart);
                    }

                    fatalSriTableTitleDiv.innerHTML = self.CardTitle + " - " + filterParameters.summary.label;
                }, Utilities.errorHandler);
            }
        }


    });