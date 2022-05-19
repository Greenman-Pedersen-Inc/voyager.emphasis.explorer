define(
    [
        './app/Utilities.js',
        "./app/staticData/urls.js",
        "./app/variables/createPayloadRequest.js",
        "./app/components/statistics/DataTable.js",
        "./app/components/statistics/PieChart.js",
        "esri/request",
    ],
    function(
        Utilities,
        urls,
        payloadHelper,
        DataTable,
        PieChart,
        esriRequest
    ) {
        return function LocationSummaryTable(map) {
            const self = this;
            const locationRankingTableLoading = document.getElementById('LocationRankingTableLoading');
            const locationRankingTableContainer = document.getElementById('LocationRankingTableContainer');
            const locationRankingTable = document.getElementById('LocationRankingTable');
            const locationRankingTableChart = document.getElementById('LocationRankingTableChart');
            const locationRankingTableMap = document.getElementById('LocationRankingTableMap');

            this.requestUrl = urls.topLocationsSunglareURL;
            this.ChartTitle = 'Total Crashes by Highest Severity Rating';
            this.attribute = 'LocationData';
            this.columns = [
                { data: "crashid", title: "Crash ID" },
                { data: "id", title: "ID" },
                { data: "year", title: "Year" },
                { data: "mun_cty_co", title: "County" },
                { data: "mun_mu", title: "Muni." },
                { data: "calc_sri", title: "SRI" },
                { data: "calc_milepost", title: "Milepost" },
                { data: "calc_latitude", title: "Latitude" },
                { data: "calc_longitude", title: "Longitude" },
                { data: "age", title: "Age" },
                { data: "sex", title: "Sex" },

            ];
            this.chartColumns = [
                { data: "Fatal_Count", title: "Fatal" },
                { data: "Incap_Count", title: "Incap." },
                { data: "Mod_Inj_Count", title: "Mod. Inj." },
                { data: "Comp_Pain_Count", title: "Compl. Pain" },
                { data: "Prop_Dmg_Count", title: "Prop. Dmg." }
            ];

            function FormatPieChartData(data, chartColumns) {
                var xArray = [];
                var sumArray = new Array(chartColumns.length).fill(0);
                chartColumns.forEach(col => {
                    xArray.push(col.title);
                });

                data.forEach(crash => {
                    for (var i = 0; i < chartColumns.length; i++) {
                        sumArray[i] += crash[chartColumns[i].data];
                    }
                });

                return [sumArray, xArray];
            }

            this.update = function(reportParams) {
                locationRankingTableLoading.classList.remove('hidden');
                locationRankingTableContainer.classList.add('hidden');
                var requestParams = payloadHelper.createPayloadRequest(reportParams);

                return esriRequest(self.requestUrl, { query: requestParams }).then(function(response) {
                    console.log(response.data);
                    locationRankingTableLoading.classList.add('hidden');
                    locationRankingTableContainer.classList.remove('hidden');

                    var formattedData = FormatPieChartData(response.data[self.attribute], self.chartColumns);

                    if (self.table) {
                        self.table.update(response.data[self.attribute], self.columns)
                    } else {
                        self.table = new DataTable(response.data[self.attribute], self.columns, locationRankingTable, locationRankingTableMap, map);
                    }

                    if (self.chart) {
                        self.chart.update(formattedData[0], formattedData[1], self.ChartTitle)
                    } else {
                        self.chart = new PieChart(formattedData[0], formattedData[1], locationRankingTableChart, self.ChartTitle);
                    }

                }, Utilities.errorHandler);
            }
        }


    });