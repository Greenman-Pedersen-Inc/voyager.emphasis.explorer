define([
    './app/CodeTranslator.js',
    './app/staticData/urls.js',
    'app/staticData/filterItems/emphasisAreaSelections.js',
    './js/lib/gridjs.production.min.js',
], function (CodeTranslator, urls, emphasisAreaSelections, gridjs) {
    return function DataGrid(
        initialFilterParameters,
        columns,
        chartContainerID,
        chartTitleID,
        columnSelectorID,
        suffix,
        chartLabel,
        credentials
    ) {
        const self = this;
        const chart = document.getElementById(chartContainerID);
        const chartTitle = document.getElementById(chartTitleID);
        const columnSelector = document.getElementById(columnSelectorID);
        const gridColumns = columns;

        function createDetailWhereClause(filterParameters, geomColumn, type = null) {
            var queryStringArray = [];

            if (filterParameters.summary.value !== 'nj-summary') {
                if (
                    filterParameters.summary.value == 'loc-summary' ||
                    filterParameters.summary.value == 'mpo-summary'
                ) {
                    if (filterParameters.locationFilters.mun_cty_co.value) {
                        if (filterParameters.locationFilters.mun_cty_co.value.includes(',')) {
                            var strArray = [];
                            var splitString = filterParameters.locationFilters.mun_cty_co.value.split(',');
                            splitString.forEach((element) => {
                                strArray.push("'" + element + "'");
                            });
                            queryStringArray.push('mun_cty_co IN (' + strArray.join(',') + ')');
                        } else {
                            queryStringArray.push(
                                "mun_cty_co = '" + filterParameters.locationFilters.mun_cty_co.value + "'"
                            );
                        }
                    }
                    if (filterParameters.locationFilters.mun_mu.value) {
                        queryStringArray.push(
                            "mun_mu = '" + filterParameters.locationFilters.mun_mu.value + "'"
                        );
                    }
                } else if (filterParameters.summary.value == 'sri-summary') {
                    queryStringArray.push("calc_sri = '" + filterParameters.locationFilters.sri.value + "'");
                }
            }

            queryStringArray.push(
                `(year >= ${filterParameters.getStartYear()} AND year <= ${filterParameters.getEndYear()})`
            );
            var joinedString = queryStringArray.join(' AND ');

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

        function createCrashDetailsQuery(filterParameters, columnsToQuery) {
            let table = getTable(filterParameters) + suffix;
            let whereClause = createDetailWhereClause(filterParameters, 'geom');
            let searchParams = new URLSearchParams({
                columns: columnsToQuery,
                filter: whereClause,
            });
            let query = urls.emphasisAreaPageQueryURL + table + '?' + searchParams.toString();

            return query;
        }

        function updateChartTitle(filterParameters) {
            if (filterParameters.subCategory.label) {
                chartTitle.innerHTML = `${chartLabel} - ${filterParameters.category.label} (${filterParameters.subCategory.label})`;
            } else {
                chartTitle.innerHTML = `${chartLabel} - ${filterParameters.category.label}`;
            }
        }

        gridColumns.forEach((column) => {
            let columnLink = document.createElement('a');

            columnLink.className = column.hidden
                ? 'dropdown-item column-selector'
                : 'dropdown-item column-selector column-visible';
            columnLink.innerHTML = column.name;

            columnLink.addEventListener('click', function (event) {
                event.stopPropagation();

                if (column.hidden) {
                    column.hidden = false;
                    columnLink.classList.add('column-visible');
                } else {
                    column.hidden = true;
                    columnLink.classList.remove('column-visible');
                }

                self.grid.updateConfig({ columns: gridColumns }).forceRender();
            });

            columnSelector.appendChild(columnLink);
        });

        this.grid = new gridjs.Grid({
            columns: columns,
            fixedHeader: true,
            pagination: {
                enabled: true,
                limit: 20,
                server: {
                    url: (prev, page, limit) => `${prev}&limit=${limit}&offset=${page * limit}`,
                },
            },
            server: {
                url: createCrashDetailsQuery(
                    initialFilterParameters,
                    columns.map((column) => column.id)
                ),
                then: (data) => {
                    // if the server returns no data the result of the map is undefined
                    if (data.results) {
                        return data.results.map((feature) =>
                            CodeTranslator.convertFeatureObjectValues(feature)
                        );
                    } else {
                        return [];
                    }
                },
                handle: (res) => {
                    let dataObject = { count: '0', results: [] };

                    // no matching records found
                    if (res.status === 404) {
                        dataObject;
                    } // no data returned
                    if (res.ok) {
                        return res.json();
                    }

                    throw Error('oh no :(');
                },
                total: (data) => data.count,
            },
            className: {
                table: 'dataPageTable',
                tbody: 'dataPageTableBody',
                th: 'dataPageTableHeader',
                td: 'dataPageTableCell',
            },
        }).render(chart);

        this.update = function (filterParameters, empty = false) {
            updateChartTitle(filterParameters);

            if (empty) {
                self.grid
                    .updateConfig({
                        data: [],
                    })
                    .forceRender();
            } else {
                self.grid
                    .updateConfig({
                        server: {
                            url: createCrashDetailsQuery(
                                filterParameters,
                                columns.map((column) => column.id)
                            ),
                            headers: {
                                token: credentials.token,
                            },
                            then: (data) => {
                                // if the server returns no data the result of the map is undefined
                                if (data.results) {
                                    return data.results.map((feature) =>
                                        CodeTranslator.convertFeatureObjectValues(feature)
                                    );
                                } else {
                                    return [];
                                }
                            },
                            handle: (res) => {
                                let dataObject = { count: '0', results: [] };

                                if (res.status === 404) {
                                    return dataObject;
                                } // no data returned
                                if (res.status === 500) {
                                    return dataObject;
                                } // no data returned
                                if (res.ok) {
                                    return res.json();
                                }

                                throw Error('oh no :(');
                            },
                            total: (data) => data.count,
                        },
                    })
                    .forceRender();
            }
        };
        this.resize = function () {
            self.grid.forceRender();
        };
    };
});
