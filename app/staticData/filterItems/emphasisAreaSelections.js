define(function () {
    // the label is the readable title on the UI. the value is what gets pushed into the service.
    var emphasisAreaSelections = [
        { label: 'Lane Departure', value: 'lane_departure', "data-table": 'lane_departure' },
        { label: 'Intersections', value: 'intersection', "data-table": 'intersection' },
        { label: 'Pedestrians & Cyclists', value: 'ped_cyclist', "data-table": 'ped_bike' },
        {
            label: 'Driver Behavior', value: 'driver_behavior', categories: [
                { label: "Aggressive", value: "aggressive", "data-table": "db_aggressive" },
                { label: "Drowsy/Distracted", value: "drowsy_distracted", "data-table": "db_drowsy_distracted" },
                { label: "Impaired", value: "impaired", "data-table": "db_impaired" },
                { label: "Unlicensed", value: "unlicensed",  "data-table": "db_unlicensed" },
                { label: "Unbelted", value: "unbelted",  "data-table": "db_unbelted" },
                { label: "Heavy Vehicle", value: "heavy_vehicle",  "data-table": "db_heavy_vehicles" },
            ]
        },
        {
            label: 'Other Vulnerable Road Users', value: 'road_users', categories: [
                { label: "Mature Driver", value: "mature",  "data-table": "ru_mature_driver" },
                { label: "Younger Driver", value: "younger",  "data-table": "ru_younger_driver" },
                { label: "Motorcyclist", value: "motorcyclist",  "data-table": "ru_motorcyclist" },
                { label: "Work Zone", value: "work_zone",  "data-table": "ru_work_zone" },
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