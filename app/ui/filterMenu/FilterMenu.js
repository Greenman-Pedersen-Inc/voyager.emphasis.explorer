define([
        "./app/components/filterMenu/radioSelect.js",
        "./app/components/filterMenu/locationPickers.js",
        "./app/components/filterMenu/sriPicker.js",
        "./app/components/filterMenu/filterCheckbox.js",
        "./app/components/filterMenu/yearPickers.js",
        "./app/components/filterMenu/attributeList.js",
        "./app/components/filterMenu/headers.js",
        "./app/components/filterMenu/tooltips.js",
        "./app/components/filterMenu/generateReportButton.js",
        "./app/variables/queryString.js",
        "./app/components/filterMenu/tour.js"
    ]),
    function(
        radioHelper,
        locationPickers,
        sriPicker,
        checkboxHelper,
        yearPickers,
        attrListHelper,
        headersHelper,
        tooltipsHelper,
        reportButtonHelper,
        queryString,
        tourHelper
    ) {
        return function FilterMenu(mapFilter, filterParameters, parent) {
            initiateRadioHeaders(mapFilter, statisticPage); // enable report type handlers
            initiateSunGlareConditions(mapFilter, statisticPage); // initiate weather condition checkboxes
            locationPickers.initiateLocationPickers(reportParams, queryParams, mapFilter, statisticPage, self);
            sriPicker.initiateSriPicker(reportParams, queryParams, mapFilter, userInfo, statisticPage, self);
            yearPickers.initiateYearPickers(mapFilter, statisticPage, self);
            radioHelper.initiateSortOptions(mapFilter, statisticPage);
        }
    }