define(
    [
        "./app/staticData/urls.js",
        "./app/staticData/filterItems/api.js",
        "./app/components/statistics/DataTable.js",
    ],
    function(
        urls,
        api,
        DataTable
    ) {
        const chart = document.getElementById('PedestriansPersonsTable');
        const chartContainer = document.getElementById('PedestriansPersonsTableContainer');
        const chartLoading = document.getElementById('PedestriansPersonsTableLoading');
        const chartTitle = document.getElementById('PedestriansPersonsTableTitle');
        const chartButtonDiv = document.getElementById('PedestriansPersonsTableButtons');

        function createDetailWhereClause(filterParameters, geomColumn) {
            var queryStringArray = [];

            if (filterParameters.summary.value !== "nj-summary") {
                if (type == "muni" || type == "county") {
                    if (filterParameters.locationFilters.mun_cty_co.value) {
                        if (filterParameters.locationFilters.mun_cty_co.value.includes(",")) {
                            var strArray = [];
                            var splitString = filterParameters.locationFilters.mun_cty_co.value.split(",");
                            splitString.forEach(element => {
                                strArray.push("'" + element + "'");
                            });
                            queryStringArray.push("mun_cty_co IN (" + strArray.join(",") + ")");
                        } else {
                            queryStringArray.push("mun_cty_co = '" + filterParameters.locationFilters.mun_cty_co.value + "'");
                        }
                    }
                    if (filterParameters.locationFilters.mun_mu.value) {
                        queryStringArray.push("mun_mu = '" + filterParameters.locationFilters.mun_mu.value + "'");
                    }
                } else if (type == "sri") {
                    queryStringArray.push("calc_sri = '" + filterParameters.locationFilters.sri.value + "'");
                }
            }

            queryStringArray.push("(year >= " + filterParameters.getStartYear() + " AND year <= " + filterParameters.getEndYear() + ")");
            var joinedString = queryStringArray.join(" AND ");

            return joinedString;
        }

        function getTable(filterParameters) {
            var catValue;
            if (filterParameters.subCategory.value) {
                catValue = filterParameters.subCategory.value;
            } else {
                catValue = filterParameters.category.value;
            }
            var tableBase = emphasisAreaSelections.getTable(catValue);
            var returnTable = tableBase;
            return returnTable;
        }

        function getCrashDetailsPedestriansQuery(filterParameters) {
            var table = getTable(filterParameters) + "_pedestrians";
            let whereClause = createDetailWhereClause(filterParameters, "geom");
            let searchParams = new URLSearchParams({
                geom_column: 'geom',
                columns: '*',
                filter: whereClause
            });
            let query = urls.emphasisAreaQueryURL + table + "?" + searchParams.toString();

            return query;
        }

        return function PedestrianTable(map) {
            const self = this;
            this.map = map;
            this.requestUrl = urls.emphasisAreaPersonsURL;
            this.columns = [
                { data: "acc_case", title: "Crash ID" },
                { data: "id", title: "Person ID" },
                { data: "severity_rating", title: "Severity" },
                { data: "crash_type", title: "Crash Type" },
                { data: "year", title: "Year" },
                { data: "mun_cty_co", title: "County" },
                { data: "mun_mu", title: "Muni." },
                { data: "calc_sri", title: "SRI" },
                { data: "calc_milepost", title: "Milepost" },
                { data: "calc_latitude", title: "Latitude" },
                { data: "calc_longitude", title: "Longitude" },
                { data: "posted_speed", title: "Posted Speed" },
                { data: "age", title: "Age" },
                { data: "sex", title: "Sex" },
                { data: "flg_cell_in_use", title: "Cellphone Used?" },
                { data: "hit_run", title: "Hit/Run?" },
                { data: "intersection", title: "At Intersection" },
                { data: "light_cond_code", title: "Light Condition" },
                { data: "surf_cond_code", title: "Surface Condition" },
                { data: "road_sys_code", title: "Road System" },
                // { data: "is_urban", title: "Urban" },
                // { data: "type_code", title: "Jurisdiction" },
                // { data: "f_system_code", title: "Functional Class" }
            ];
            this.currentTableFileName = '';
            this.dataTableOptions = {
                dom: 'Bfrtip',
                columns: self.columns,
                searching: false,
                // responsive: true,
                scrollY: "25rem",
                scrollX: true,
                paging: false,
                buttons: [{
                        extend: 'csv',
                        filename: this.currentTableFileName,
                        exportOptions: {
                            columns: ':visible'
                        },
                        className: 'font-size-dt-buttons'
                    },
                    {
                        extend: 'excel',
                        filename: this.currentTableFileName,
                        exportOptions: {
                            columns: ':visible'
                        },
                        className: 'font-size-dt-buttons'
                    },
                    {
                        extend: 'colvis',
                        className: 'font-size-dt-buttons'
                    }
                ]
            };
            this.updateChartTitle = function(filterParameters) {
                if (filterParameters.subCategory.label) {
                    chartTitle.innerHTML = "Pedestrians Persons Data - " + filterParameters.category.label + " (" + filterParameters.subCategory.label + ")";
                } else
                    chartTitle.innerHTML = "Pedestrians Persons Data - " + filterParameters.category.label;
            }
            this.update = function(filterParameters, crashids) {
                chartLoading.classList.remove('hidden');
                chartContainer.classList.remove('hidden');

                self.currentTableFileName = 'pedestrians_data_' + filterParameters.category.value;

                if (crashids == null || crashids == undefined) {
                    if (self.table) {
                        self.table.table.clear();
                        self.table.table.draw();
                    } else {
                        self.dataTableOptions.data = null;
                        self.table = new DataTable(chart, chartButtonDiv, self.dataTableOptions);
                    }
                    chartLoading.classList.add('hidden');
                } else {
                    var personsQuery = api.GetPersonsQuery(filterParameters, crashids, 'pedestrians');
                    if (personsQuery == null) {
                        if (self.table) {
                            self.table.table.clear();
                            self.table.table.draw();
                        } else {
                            self.dataTableOptions.data = null;
                            self.table = new DataTable(chart, chartButtonDiv, self.dataTableOptions);
                        }
                        chartLoading.classList.add('hidden');
                    } else {
                        fetch(personsQuery, {
                                method: 'POST',
                                body: crashids,
                            })
                            .then(response => response.json())
                            .then(result => {
                                if (self.table) {
                                    self.table.update(result, self.columns)
                                } else {
                                    self.currentTableFileName = 'pedestrians_data_' + filterParameters.category.value;
                                    self.table = new DataTable(chart, chartButtonDiv, self.dataTableOptions);
                                }
                                chartLoading.classList.add('hidden');
                            })
                            .catch(error => {
                                console.error('Error:', error);
                                chartLoading.classList.add('hidden');
                            });
                    }
                }
            }
        }
    });