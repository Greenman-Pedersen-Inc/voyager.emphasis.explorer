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
        const chart = document.getElementById('OccupantsPersonsTable');
        const chartContainer = document.getElementById('OccupantsPersonsTableContainer');
        const chartLoading = document.getElementById('OccupantsPersonsTableLoading');
        const chartTitle = document.getElementById('OccupantsPersonsTableTitle');
        const chartButtonDiv = document.getElementById('OccupantsPersonsTableButtons');

        function createWhereClause(filterParameters, type = null) {
            var queryStringArray = [];

            // if (filterParameters.summary.value !== "nj-summary") {
            //     if (type == "muni" || type == "county") {
            //         if (filterParameters.locationFilters.mun_cty_co.value) {
            //             if (filterParameters.locationFilters.mun_cty_co.value.includes(",")) {
            //                 var strArray = [];
            //                 var splitString = filterParameters.locationFilters.mun_cty_co.value.split(",");
            //                 splitString.forEach(element => {
            //                     strArray.push("'" + element + "'");
            //                 });
            //                 queryStringArray.push("mun_cty_co IN (" + strArray.join(",") + ")");
            //             } else {
            //                 queryStringArray.push("mun_cty_co = '" + filterParameters.locationFilters.mun_cty_co.value + "'");
            //             }
            //         }
            //         if (filterParameters.locationFilters.mun_mu.value) {
            //             queryStringArray.push("mun_mu = '" + filterParameters.locationFilters.mun_mu.value + "'");
            //         }
            //     } else if (type == "sri") {
            //         queryStringArray.push("calc_sri = '" + filterParameters.locationFilters.sri.value + "'");
            //         //joinedString += " GROUP BY calc_sri, calc_milepost, " + geomColumn;
            //     }
            // }


            if (filterParameters.summary.value == 'loc-summary' || filterParameters.summary.value == 'mpo-summary') {
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
            } else if (filterParameters.summary.value == 'sri-summary') {
                queryStringArray.push("calc_sri = '" + filterParameters.locationFilters.sri.value + "'");
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

        function getSriCrashIDQuery(filterParameters) {
            var base = getTable(filterParameters);
            var table = base + "_crashes";
            var whereClause = createWhereClause(filterParameters, 'sri');
            var searchParams = new URLSearchParams({
                columns: "crashid",
                filter: whereClause,
            });
            var query = urls.emphasisAreaGeojsonURL + table + "?" + searchParams.toString();
            console.log(query);
            return query;
        }

        return function OccupantTable(map) {
            const self = this;

            this.map = map;
            this.requestUrl = urls.emphasisAreaPersonsURL;
            this.columns = [
                { data: "acc_case", title: "Crash ID" },
                { data: "veh_id", title: "Vehicle ID" },
                { data: "id", title: "Person ID" },
                { data: "position_in_code", title: "Person Type" },
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
                { data: "unlicensed", title: "Unlicensed?" },
                { data: "intersection", title: "At Intersection" },
                { data: "light_cond_code", title: "Light Condition" },
                { data: "surf_cond_code", title: "Surface Condition" },
                // { data: "road_sys_code", title: "Road System" },
                // { data: "is_urban", title: "Urban" },
                // { data: "type_code", title: "Jurisdiction" },
                // { data: "f_system_code", title: "Functional Class" }
            ];
            this.currentTableFileName = '';
            this.dataTableOptions = {
                dom: 'Bfrtip',
                columns: self.columns,
                searching: false,
                scrollY: "25rem",
                scrollX: true,
                paging: false,
                buttons: [{
                        extend: 'csv',
                        filename: self.currentTableFileName,
                        exportOptions: {
                            columns: ':visible'
                        },
                        className: 'font-size-dt-buttons'
                    },
                    {
                        extend: 'excel',
                        filename: self.currentTableFileName,
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
            this.dataTable = new DataTable(chart, chartButtonDiv, this.dataTableOptions);
            this.updateChartTitle = function(filterParameters) {
                if (filterParameters.subCategory.label) {
                    chartTitle.innerHTML = "Occupants Persons Data - " + filterParameters.category.label + " (" + filterParameters.subCategory.label + ")";
                } else
                    chartTitle.innerHTML = "Occupants Persons Data - " + filterParameters.category.label;
            }
            this.update = function(filterParameters, crashids) {
                var sriQuery = getSriCrashIDQuery(filterParameters)
                fetch(sriQuery)
                    .then(response => response.json())
                    .then(
                        (sriData) => {
                            self.currentCrashIDs = sriData.features.map(feature => feature.properties.crashid);
                            Promise.all([
                                self.occupantsPersonsTable.update(filterParameters, self.currentCrashIDs),
                                self.pedestriansPersonsTable.update(filterParameters, self.currentCrashIDs)
                            ]).then(() => {
                                console.log('complete!');
                                // document.querySelectorAll('#filterAccordion .card').forEach(element => {
                                //     element.classList.remove('paused');
                                // });
                            })

                        })



                chartLoading.classList.remove('hidden');
                chartContainer.classList.remove('hidden');

                self.currentTableFileName = 'sri_data_' + filterParameters.category.value;

                if (filterParameters.category.value == "ped_cyclist") {
                    if (self.table) {
                        self.table.table.clear();
                        self.table.table.draw();
                    } else {
                        dataTableOptions.data = null;
                        self.table = new DataTable(chart, chartButtonDiv, dataTableOptions);
                    }
                    chartLoading.classList.add('hidden');
                } else if (crashids == null || crashids == undefined) {
                    if (self.table) {
                        self.table.table.clear();
                        self.table.table.draw();
                    } else {
                        dataTableOptions.data = null;
                        self.table = new DataTable(chart, chartButtonDiv, dataTableOptions);
                    }
                    chartLoading.classList.add('hidden');
                } else {
                    var personsQuery = api.GetPersonsQuery(filterParameters, crashids);
                    if (personsQuery == null) {
                        if (self.table) {
                            self.table.table.clear();
                            self.table.table.draw();
                        } else {
                            dataTableOptions.data = null;
                            self.table = new DataTable(chart, chartButtonDiv, dataTableOptions);
                        }
                        chartLoading.classList.add('hidden');
                    } else {
                        fetch(personsQuery, {
                                method: 'POST',
                                body: crashids,
                            })
                            .then(response => response.json())
                            .then(personsData => {
                                console.log(personsData);
                                if (self.table) {
                                    self.table.update(personsData, self.columns)
                                } else {
                                    dataTableOptions.data = personsData;
                                    self.table = new DataTable(chart, chartButtonDiv, dataTableOptions);
                                }
                                chartLoading.classList.add('hidden');
                            });
                    }
                }
            }
        }
    });