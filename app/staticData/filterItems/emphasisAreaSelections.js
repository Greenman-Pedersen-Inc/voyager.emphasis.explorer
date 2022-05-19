define(function () {
    // the label is the readable title on the UI. the value is what gets pushed into the service.
    var emphasisAreaSelections = [
        { label: 'Lane Departure', value: 'lanedeparture', "data-table": 'lane_departure' },
        { label: 'Intersections', value: 'intersection', "data-table": 'intersection' },
        { label: 'Pedestrians & Cyclists', value: 'pedbike', "data-table": 'ped_bike' },
        {
            label: 'Driver Behavior', value: 'driverbehavior', categories: [
                { label: "Aggressive", value: "Aggressive", "data-table": "db_aggressive" },
                { label: "Drowsy/Distracted", value: "DrowsyDistracted", "data-table": "db_drowsy_distracted" },
                { label: "Impaired", value: "Impaired", "data-table": "db_impaired" },
                { label: "Unlicensed", value: "Unlicensed",  "data-table": "db_unlicensed" },
                { label: "Unbelted", value: "Unbelted",  "data-table": "db_unbelted" },
                { label: "Heavy Vehicle", value: "HeavyVehicle",  "data-table": "db_heavy_vehicles" },
            ]
        },
        {
            label: 'Other Vulnerable Road Users', value: 'roadusers', categories: [
                { label: "Mature Driver", value: "Mature",  "data-table": "ru_mature_driver" },
                { label: "Younger Driver", value: "Younger",  "data-table": "ru_younger_driver" },
                { label: "Motorcyclist", value: "Motorcyclist",  "data-table": "ru_motorcyclist" },
                { label: "Work Zone", value: "WorkZone",  "data-table": "ru_work_zone" },
            ]
        }
    ];

    function getTable(value) {
        for (let index = 0; index < emphasisAreaSelections.length; index++) {
            var tableData = emphasisAreaSelections[index];
            if (tableData.categories) {
                for (let j = 0; j < tableData.categories.length; j++) {
                    var subCat = tableData.categories[j];
                    if (subCat.value == value) {
                        return 'emphasis_areas_2021.' + subCat["data-table"];
                    }
                }
            }
            else {
                if (tableData.value == value) {
                    return 'emphasis_areas_2021.' + tableData["data-table"];
                }
            }
        }
    }

    return {
        getTable:getTable
    }
});