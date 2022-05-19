define([
    "./app/ui/data/DataGrid.js",
    "./app/ui/data/SRITable.js",
], function(
    DataGrid,
    SRITable,
) {
    return function DataPage(initialFilterParameters) {
        const self = this;

        const crashColumns = [
            { id: 'acc_case', name: 'Case Number', hidden: false },
            { id: 'year', name: 'Year', hidden: false },
            { id: 'mun_cty_co', name: 'County', hidden: false },
            { id: 'mun_mu', name: 'Muni.', hidden: false },
            { id: 'calc_sri', name: 'SRI', hidden: false },
            { id: 'calc_milepost', name: 'MP', hidden: false },
            { id: 'posted_speed', name: 'Posted', hidden: false },
            { id: 'xstreet_name', name: 'Cross Street', hidden: true },
            { id: 'posted_speed_xstreet', name: 'Cross Posted', hidden: true },
            { id: 'no_killed', name: 'Killed', hidden: true },
            { id: 'no_injured', name: 'Inj.', hidden: true },
            { id: 'ped_killed', name: 'Ped. Killed', hidden: true },
            { id: 'ped_injured', name: 'Ped. Inj.', hidden: true },
        ];
        const occupantColumns = [
            { id: "acc_case", name: "Case Number", hidden: false },
            { id: "veh_id", name: "Vehicle ID", hidden: true },
            { id: "id", name: "Person ID", hidden: false },
            { id: "position_in_code", name: "Person Type", hidden: true },
            { id: "severity_rating", name: "Severity", hidden: false },
            { id: "crash_type", name: "Crash Type", hidden: false },
            { id: "year", name: "Year", hidden: false },
            { id: "mun_cty_co", name: "County", hidden: false },
            { id: "mun_mu", name: "Muni.", hidden: false },
            { id: "calc_sri", name: "SRI", hidden: false },
            { id: "calc_milepost", name: "Milepost", hidden: false },
            { id: "calc_latitude", name: "Latitude", hidden: true },
            { id: "calc_longitude", name: "Longitude", hidden: true },
            { id: "posted_speed", name: "Posted Speed", hidden: true },
            { id: "age", name: "Age", hidden: true },
            { id: "sex", name: "Sex", hidden: true },
            { id: "flg_cell_in_use", name: "Cellphone Used?", hidden: true },
            { id: "hit_run", name: "Hit/Run?", hidden: true },
            { id: "unlicensed", name: "Unlicensed?", hidden: true },
            { id: "intersection", name: "At Intersection", hidden: true },
            { id: "light_cond_code", name: "Light Condition", hidden: true },
            { id: "surf_cond_code", name: "Surface Condition", hidden: true },
        ];
        const pedestrianColumns = [
            { id: "acc_case", name: "Case Number", hidden: false },
            { id: "id", name: "Person ID", hidden: true },
            { id: "severity_rating", name: "Severity", hidden: false },
            { id: "crash_type", name: "Crash Type", hidden: false },
            { id: "year", name: "Year", hidden: false },
            { id: "mun_cty_co", name: "County", hidden: false },
            { id: "mun_mu", name: "Muni.", hidden: false },
            { id: "calc_sri", name: "SRI", hidden: false },
            { id: "calc_milepost", name: "Milepost", hidden: false },
            { id: "calc_latitude", name: "Latitude", hidden: true },
            { id: "calc_longitude", name: "Longitude", hidden: true },
            { id: "posted_speed", name: "Posted Speed", hidden: true },
            { id: "age", name: "Age", hidden: true },
            { id: "sex", name: "Sex", hidden: true },
            { id: "flg_cell_in_use", name: "Cellphone Used?", hidden: true },
            { id: "hit_run", name: "Hit/Run?", hidden: true },
            { id: "intersection", name: "At Intersection", hidden: true },
            { id: "light_cond_code", name: "Light Condition", hidden: true },
            { id: "surf_cond_code", name: "Surface Condition", hidden: true },
            { id: "road_sys_code", name: "Road System", hidden: true },
        ];

        this.crashTable = new DataGrid(initialFilterParameters, crashColumns, 'crashTable', 'crashTableTitle', 'crashColumnList', '_crashes', 'Crashes Selected');
        this.occupantTable = new DataGrid(initialFilterParameters, occupantColumns, 'occupantTable', 'occupantTableTitle', 'occupantColumnList', '_occupants', 'Occupants Involved in Crashes');
        this.pedestrianTable = new DataGrid(initialFilterParameters, pedestrianColumns, 'pedestrianTable', 'pedestrianTableTitle', 'pedestrianColumnList', '_pedestrians', 'Pedestrians Involved in Crashes');
        // this.sriTable = new SRITable();

        this.resize = function() {
            self.crashTable.resize();
            self.occupantTable.resize();
            self.pedestrianTable.resize();
        }

        this.update = function(filterParameters) {
            // if (filterParameters.locationFilters.sri.value) {
            //     // self.sriTable.update(filterParameters);
            // } else {
            self.crashTable.update(filterParameters);
            self.occupantTable.update(filterParameters);
            self.pedestrianTable.update(filterParameters);
            // }
        }
    }
})