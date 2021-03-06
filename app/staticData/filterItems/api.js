define(['./app/staticData/urls.js', './app/staticData/filterItems/emphasisAreaSelections.js'], function (
    urls,
    emphasisAreaSelections
) {
    function postData(credentials, url = '', data = {}) {
        return fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                credentials: JSON.stringify(credentials),
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // no-referrer, *client
            body: JSON.stringify(data), // body data type must match "Content-Type" header
        })
            .then((response) => {
                if (response.status === 200) {
                    return response.json().then((data) => {
                        return data;
                    });
                } else {
                    return Promise.resolve({
                        features: [],
                        type: 'FeatureCollection',
                    });
                }
            })
            .then((features) => {
                return features;
            })
            .catch(errorHandler);
    }

    function CreateWhereClause(filterParameters, geomColumn, type = null, includeMuni = true) {
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
                        queryStringArray.push('crash_data.mun_cty_co IN (' + strArray.join(',') + ')');
                    } else {
                        queryStringArray.push(
                            "crash_data.mun_cty_co = '" +
                                filterParameters.locationFilters.mun_cty_co.value +
                                "'"
                        );
                    }
                }
                if (filterParameters.locationFilters.mun_mu.value && includeMuni) {
                    queryStringArray.push(
                        "crash_data.mun_mu = '" + filterParameters.locationFilters.mun_mu.value + "'"
                    );
                }
            } else if (
                filterParameters.summary.value == 'sri-summary' &&
                filterParameters.locationFilters.sri.value
            ) {
                queryStringArray.push("calc_sri = '" + filterParameters.locationFilters.sri.value + "'");
            }
        }

        queryStringArray.push(
            '(year >= ' +
                filterParameters.getStartYear() +
                ' AND year <= ' +
                filterParameters.getEndYear() +
                ')'
        );
        var joinedString = queryStringArray.join(' AND ');

        if (geomColumn !== 'geom') {
            if (type == 'muni') {
                joinedString +=
                    '  GROUP BY muni_data.mun, muni_data.mun_mu, muni_data.county, muni_data.mun_cty_co, muni_data.' +
                    geomColumn;
            } else if (type == 'county') {
                joinedString +=
                    ' GROUP BY county_data.county, crash_data.mun_cty_co, county_data.' + geomColumn;
            }
            // else if (type == "sri") {
            //     joinedString += " GROUP BY calc_sri, calc_milepost, " + geomColumn;
            // }
        }

        return joinedString;
    }

    function CreateDetailWhereClause(filterParameters, geomColumn) {
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
                    queryStringArray.push("mun_mu = '" + filterParameters.locationFilters.mun_mu.value + "'");
                }
            } else if (
                filterParameters.summary.value == 'sri-summary' &&
                filterParameters.locationFilters.sri.value
            ) {
                queryStringArray.push("calc_sri = '" + filterParameters.locationFilters.sri.value + "'");
            }
        }

        queryStringArray.push(
            '(year >= ' +
                filterParameters.getStartYear() +
                ' AND year <= ' +
                filterParameters.getEndYear() +
                ')'
        );
        var joinedString = queryStringArray.join(' AND ');

        if (geomColumn !== 'geom') {
            if (type == 'muni') {
                joinedString += ' GROUP BY mun, mun_mu, county, mun_cty_co, ' + geomColumn;
            } else if (type == 'county') {
                joinedString += ' GROUP BY county, mun_cty_co, ' + geomColumn;
            }
            // else if (type == "sri") {
            //     joinedString += " GROUP BY calc_sri, calc_milepost, " + geomColumn;
            // }
        }

        return joinedString;
    }

    function GetAccidentsBySriQuery(sri, mp, filterParameters) {
        var searchParams = new URLSearchParams({
            geom_column: 'geom',
            columns:
                'crashid, year, mun_cty_co, mun_mu, acc_case, calc_sri, calc_milepost, calc_latitude, calc_longitude, mercatorx, mercatory, dept_num, dept_name, station, acc_date, acc_dow, acc_time, severity_code, intersection, alcohol_involved, hazmat_involved, hs_collision_type, hs_fixed_object, crash_type, tot_veh_involved, location, location_dir, road_sys_code, road_char_code, road_horiz_align_code, road_grade_code, road_surf_code, surf_cond_code, light_cond_code, environ_cond_code, road_median_code, temp_traffic_zone, dist_to_xstreet, dist_xstreet_unit, dir_from_xstreet, xstreet_name, is_ramp, ramp_route, ramp_direction, posted_speed, posted_speed_xstreet, first_harmful_event, other_prop_damage, flg_cell_in_use, driver_phys_apptly_nrml, driver_phys_alcl_use, driver_phys_drug_use_illicit, driver_phys_medication, driver_phys_alcl_drug_med_use, driver_phys_handicaps, driver_phys_illness, driver_phys_fatigue, driver_phys_fell_aslp, driver_phys_other, driver_phys_unknown, driver_phys_not_recorded, cyclist_involved, occupant_phys_cond_killed, occupant_phys_cond_incapacitated, occupant_phys_cond_moderate_injury, occupant_phys_cond_complaint_pain, occupant_phys_cond_unknown, occupant_phys_cond_not_recorded, pedestrian_phys_cond_killed, pedestrian_phys_cond_incapacitated, pedestrian_phys_cond_moderate_injury, pedestrian_phys_cond_complaint_pain, pedestrian_phys_cond_unknown, functional_class, hit_run, ped_incapacitated, cyclist_killed, cyclist_incapacitated, cyclist_complaint_of_pain, cyclist_moderate_pain, veh_one_travel_dir_code, veh_two_travel_dir_code',
            filter: `calc_sri = '${sri}' AND calc_milepost = ${mp} AND year BETWEEN ${filterParameters.getStartYear()} AND ${filterParameters.getEndYear()}`,
        });
        var table = getTable(filterParameters) + '_crashes';
        var query = urls.emphasisAreaGeojsonURL + table + '?' + searchParams.toString();
        return query;
    }

    function CreateSearchParameters(whereClause, bounds, basic = true) {
        var query = new URLSearchParams({
            geom_column: 'geom',
            columns: basic
                ? 'crashid'
                : 'crashid, year, mun_cty_co, mun_mu, acc_case, dln, calc_sri, calc_milepost, calc_latitude, calc_longitude, mercatorx, mercatory, dept_num, dept_name, station, acc_date, acc_dow, acc_time, severity_code, intersection, alcohol_involved, hazmat_involved, hs_collision_type, hs_fixed_object, crash_type, tot_veh_involved, location, location_dir, road_sys_code, road_char_code, road_horiz_align_code, road_grade_code, road_surf_code, surf_cond_code, light_cond_code, environ_cond_code, road_median_code, temp_traffic_zone, dist_to_xstreet, dist_xstreet_unit, dir_from_xstreet, xstreet_name, is_ramp, ramp_route, ramp_direction, posted_speed, posted_speed_xstreet, first_harmful_event, other_prop_damage, flg_cell_in_use, driver_phys_apptly_nrml, driver_phys_alcl_use, driver_phys_drug_use_illicit, driver_phys_medication, driver_phys_alcl_drug_med_use, driver_phys_handicaps, driver_phys_illness, driver_phys_fatigue, driver_phys_fell_aslp, driver_phys_other, driver_phys_unknown, driver_phys_not_recorded, cyclist_involved, occupant_phys_cond_killed, occupant_phys_cond_incapacitated, occupant_phys_cond_moderate_injury, occupant_phys_cond_complaint_pain, occupant_phys_cond_unknown, occupant_phys_cond_not_recorded, pedestrian_phys_cond_killed, pedestrian_phys_cond_incapacitated, pedestrian_phys_cond_moderate_injury, pedestrian_phys_cond_complaint_pain, pedestrian_phys_cond_unknown, functional_class, hit_run, ped_incapacitated, cyclist_killed, cyclist_incapacitated, cyclist_complaint_of_pain, cyclist_moderate_pain, veh_one_travel_dir_code, veh_two_travel_dir_code',
            // columns: 'crashid, year, mun_cty_co, mun_mu, acc_case, dln, calc_sri, calc_milepost, calc_latitude, calc_longitude, mercatorx, mercatory, dept_num, dept_name, station, acc_date, acc_dow, acc_time, severity_code, intersection, alcohol_involved, hazmat_involved, hs_collision_type, hs_fixed_object, crash_type, tot_veh_involved, location, location_dir, road_sys_code, road_char_code, road_horiz_align_code, road_grade_code, road_surf_code, surf_cond_code, light_cond_code, environ_cond_code, road_median_code, temp_traffic_zone, dist_to_xstreet, dist_xstreet_unit, dir_from_xstreet, xstreet_name, is_ramp, ramp_route, ramp_direction, posted_speed, posted_speed_xstreet, first_harmful_event, other_prop_damage, flg_cell_in_use, driver_phys_apptly_nrml, driver_phys_alcl_use, driver_phys_drug_use_illicit, driver_phys_medication, driver_phys_alcl_drug_med_use, driver_phys_handicaps, driver_phys_illness, driver_phys_fatigue, driver_phys_fell_aslp, driver_phys_other, driver_phys_unknown, driver_phys_not_recorded, cyclist_involved, occupant_phys_cond_killed, occupant_phys_cond_incapacitated, occupant_phys_cond_moderate_injury, occupant_phys_cond_complaint_pain, occupant_phys_cond_unknown, occupant_phys_cond_not_recorded, pedestrian_phys_cond_killed, pedestrian_phys_cond_incapacitated, pedestrian_phys_cond_moderate_injury, pedestrian_phys_cond_complaint_pain, pedestrian_phys_cond_unknown, functional_class, hit_run, ped_incapacitated, cyclist_killed, cyclist_incapacitated, cyclist_complaint_of_pain, cyclist_moderate_pain, veh_one_travel_dir_code, veh_two_travel_dir_code',
            filter: whereClause,
        });
        if (bounds) {
            var sw = bounds.getSouthWest();
            var ne = bounds.getNorthEast();
            query += '&bounds=' + sw.lng + '%2C' + sw.lat + '%2C' + ne.lng + '%2C' + ne.lat;
        }
        return query;
    }

    function getTable(filterParameters) {
        let catValue;

        if (filterParameters.subCategory) {
            if (filterParameters.subCategory.value) {
                catValue = filterParameters.subCategory.value;
            } else {
                catValue = filterParameters.category.value;
            }
        } else {
            catValue = filterParameters.category.value;
        }

        let tableBase = emphasisAreaSelections.getTable(catValue);
        let returnTable = tableBase;

        return returnTable;
    }

    function GetCrash(credentials, crashArray) {
        return postData(credentials, urls.crashURL, { crash_array: crashArray }).then(function (response) {
            if (response.tokenError) {
                console.error(response);
            } else {
                return response;
            }
        });
    }

    function GetCrashesQuery(filterParameters, bounds) {
        var table = getTable(filterParameters) + '_crashes';
        var whereClause = CreateWhereClause(filterParameters, 'geom');
        var searchParams = CreateSearchParameters(whereClause, bounds);
        var query = urls.emphasisAreaGeojsonURL + table + '?' + searchParams.toString();
        return query;
    }

    function GetCrashDetailsQuery(filterParameters) {
        var table = getTable(filterParameters) + '_crashes';
        var whereClause = CreateDetailWhereClause(filterParameters, 'geom');
        var searchParams = CreateSearchParameters(whereClause, false, false);
        var query = urls.emphasisAreaCrashIDQueryURL + table + '?' + searchParams.toString();
        return query;
    }

    function GetCountyHeatmapQuery(filterParameters) {
        var base = getTable(filterParameters);
        var table = base + '_crashes_cty/{z}/{x}/{y}?';
        var whereClause = CreateWhereClause(filterParameters, 'wkb_geometry', 'county', false);
        var searchParams = new URLSearchParams({
            geom_column: 'wkb_geometry',
            filter: whereClause,
        });
        var query = urls.emphasisAreaMvtCountyURL + table + searchParams.toString();
        return {
            tileEndpoint: query,
            sourceLayer: `${base}_crashes_cty`,
        };
    }

    function GetMuniHeatmapQuery(filterParameters) {
        var base = getTable(filterParameters);
        var table = base + '_crashes_muni/{z}/{x}/{y}?';
        var whereClause = CreateWhereClause(filterParameters, 'wkb_geometry', 'muni');
        var searchParams = new URLSearchParams({
            geom_column: 'wkb_geometry',
            filter: whereClause,
        });
        var query = urls.emphasisAreaMvtMuniURL + table + searchParams.toString();
        return {
            tileEndpoint: query,
            sourceLayer: `${base}_crashes_muni`,
        };
    }

    function GetClusterHeatmapQuery(filterParameters) {
        var base = getTable(filterParameters);
        var table = base + '_crashes/{z}/{x}/{y}?';
        var whereClause = CreateWhereClause(filterParameters, 'geom');
        var searchParams = new URLSearchParams({
            geom_column: 'geom',
            filter: whereClause,
        });
        var query = urls.emphasisAreaMvtClusterURL + table + searchParams.toString();
        return {
            tileEndpoint: query,
            sourceLayer: `${base}_crashes`,
        };
    }

    function GetSriQuery(filterParameters) {
        var base = getTable(filterParameters);
        var table = base + '_sri';
        var whereClause = CreateWhereClause(filterParameters, 'wkb_geometry', 'sri');
        var searchParams = new URLSearchParams({
            geom_column: 'wkb_geometry',
            columns: 'calc_sri, calc_milepost, SUM(crashes)::INTEGER crashes, wkb_geometry',
            filter: whereClause,
            group_by: 'calc_sri, calc_milepost, wkb_geometry',
        });
        var query = urls.emphasisAreaGeojsonURL + table + '?' + searchParams.toString();
        return query;
    }

    function GetPersonsQuery(filterParameters, crashIds, type = 'occupants') {
        // var crashIds = map.getCrashids();
        if (crashIds == null) return null;
        if (crashIds.length == 0) {
            return null;
        }
        var table = getTable(filterParameters, type);
        table = table + '_' + type;
        return urls.emphasisAreaCrashIDQueryURL + table;
    }

    function errorHandler(error) {
        console.error(error);
        if (error.httpCode === 498 || error.details.error.details.httpStatus === 498) {
            var redirectDialog = new Dialog({
                title: 'Credentials Timed Out',
                content:
                    'Your session has expired. In order to continue using Safety Voyager you must sign in again. Closing this dialog will redirect to the login where you will be able to sign in again.',
                style: 'width: 400px',
                closable: true,
                onHide: function () {
                    redirectDialog.destroy();
                    window.location = 'index.html';
                },
            });
            redirectDialog.show();
        }
    }

    return {
        GetCrashDetailsQuery: GetCrashDetailsQuery,
        GetCrashesQuery: GetCrashesQuery,
        GetCountyHeatmapQuery: GetCountyHeatmapQuery,
        GetMuniHeatmapQuery: GetMuniHeatmapQuery,
        GetClusterHeatmapQuery: GetClusterHeatmapQuery,
        GetPersonsQuery: GetPersonsQuery,
        GetSriQuery: GetSriQuery,
        GetAccidentsBySriQuery: GetAccidentsBySriQuery,
        GetCrash: GetCrash,
    };
});
