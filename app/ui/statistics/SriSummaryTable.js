define(
    [
        './app/Utilities.js',
        "./app/staticData/urls.js",
        "./app/components/statistics/BarChart.js",
        "./app/components/statistics/DataTable.js",
        "esri/request",
    ],
    function(
        Utilities,
        urls,
        BarChart,
        DataTable,
        esriRequest
    ) {

        return function SriSummaryTable(map, mapFilter) {
            const self = this;
            const sriRankingTableContainer = document.getElementById('SRIRankingTableContainer');
            const sriRankingTableChart = document.getElementById('SRIRankingTableChart');
            const sriRankingTable = document.getElementById('SRIRankingTable');
            const sriRankingTableLoading = document.getElementById('SRIRankingTableLoading');
            const sriRankingTableMap = document.getElementById('SRIRankingTableMap');
            const sriRankingTableTitleDiv = document.getElementById('SRIRankingTableTitle');

            this.requestUrl = urls.topSriSunglareURL;
            this.attribute = 'SriData';
            this.columns = [
                { data: "Sri", visible: false },
                { data: "Milepost", visible: false },
                { data: "Sri_Name", title: "SRI", width: "20%" },
                { data: "Mp_Range", visible: true, title: "Milepost" },
                { data: "Crash_Count", title: "Crashes" },
                { data: "Fatal_Count", title: "Fatal" },
                { data: "Incap_Count", title: "Incap." },
                { data: "Mod_Inj_Count", title: "Mod. Inj." },
                { data: "Comp_Pain_Count", title: "Compl. Pain" },
                { data: "Prop_Dmg_Count", title: "Prop. Dmg." }
            ];
            this.chartColumns = [
                { data: "Fatal_Count", title: "Fatal" },
                { data: "Incap_Count", title: "Incap." },
                { data: "Mod_Inj_Count", title: "Mod. Inj." },
                { data: "Comp_Pain_Count", title: "Compl. Pain" },
                { data: "Prop_Dmg_Count", title: "Prop. Dmg." }
            ];
            this.update = function(filterParameters) {
                var requestParams = filterParameters.createPayloadRequest();

                sriRankingTableLoading.classList.remove('hidden');

                return esriRequest(self.requestUrl, { query: requestParams }).then(function(response) {
                    sriRankingTableContainer.classList.remove('hidden');
                    sriRankingTableLoading.classList.add('hidden');

                    if (self.table) {
                        self.table.update(response.data[self.attribute], self.columns)
                    } else {
                        self.table = new DataTable(response.data[self.attribute], self.columns, sriRankingTable, sriRankingTableMap, map, mapFilter);
                    }

                    if (self.chart) {
                        self.chart.update(response.data[self.attribute], self.chartColumns)
                    } else {
                        self.chart = new BarChart(response.data[self.attribute], self.chartColumns, sriRankingTableChart);
                    }

                    sriRankingTableTitleDiv.innerHTML = "Top 25 SRI by Total Crashes - " + filterParameters.summary.label;
                }, Utilities.errorHandler);
            }
        }


    });