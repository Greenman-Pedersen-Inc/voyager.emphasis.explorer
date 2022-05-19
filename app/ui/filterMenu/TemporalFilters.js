define([
    "./app/staticData/year.js",
    "./app/components/filterMenu/queryString.js"
], function(
    yearHelper,
    queryString
) {
    return function TemporalFilters(statisticPage, mapPage, dataPage) {
        this.initiate = function(filterParameters) {
            // initiate start and end year selections
            let allYears = yearHelper.getAllYears();
            let defaultStartYear = yearHelper.getDefaultStartYear();
            let endYear = yearHelper.getDefaultEndYear();
            let yearsAfter = yearHelper.getYearsAfter(defaultStartYear);

            allYears.forEach(element => {
                // auto-select the default start year
                if (element.value === defaultStartYear) {
                    $("#startYearPicker").append('<option value=' + element.value + ' selected="">' + element.label + '</option>');
                } else {
                    $("#startYearPicker").append('<option value=' + element.value + '>' + element.label + '</option>');
                }
            });
            $('select[name=startYearInput]').val(yearHelper.getDefaultStartYear());

            // set the end year picker
            yearsAfter.forEach(element => {
                // auto-select the default start year
                if (element.value === endYear) {
                    $("#endYearPicker").append('<option value=' + element.value + ' selected="">' + element.label + '</option>');
                } else {
                    $("#endYearPicker").append('<option value=' + element.value + '>' + element.label + '</option>');
                }
            });

            // Refresh the selectpicker to show the options
            $("#startYearPicker").selectpicker("refresh");
            $("#endYearPicker").selectpicker("refresh");

            // update end year picker when start year picker changes
            $('#startYearPicker').on('changed.bs.select', function(e) {
                if (e.target.value === null) return;

                let startYearValue = document.getElementById('startYearPicker').value
                let endYearValue = document.getElementById('endYearPicker').value
                let temporalFiltersLabel = document.getElementById('temporalFiltersLabel')
                let currentEndYear = parseInt($('#endYearPicker').val());
                let newEndYears = yearHelper.getYearsAfter(parseInt(e.target.value));

                $("#endYearPicker").empty();

                newEndYears.forEach(element => {
                    if (element.value === currentEndYear) {
                        $("#endYearPicker").append('<option value=' + element.value + ' selected="">' + element.label + '</option>');
                    } else {
                        $("#endYearPicker").append('<option value=' + element.value + '>' + element.label + '</option>');
                    }
                });

                $("#endYearPicker").selectpicker("refresh");

                temporalFiltersLabel.innerHTML = `(${startYearValue} - ${endYearValue})`
                filterParameters.updateStartYear(parseInt(e.target.value));
                queryString.updateQueryString(filterParameters);

                statisticPage.update(filterParameters);
                mapPage.update(filterParameters);
                dataPage.update(filterParameters);
            });

            // update start year picker when end year picker changes
            $('#endYearPicker').on('changed.bs.select', function(e, clickedIndex, isSelected, previousValue) {
                if (e.target.value === null) return;

                let startYearValue = document.getElementById('startYearPicker').value
                let endYearValue = document.getElementById('endYearPicker').value
                let temporalFiltersLabel = document.getElementById('temporalFiltersLabel')
                let currentStartYear = parseInt($('#startYearPicker').val());
                let newStartYears = yearHelper.getYearsBefore(parseInt(e.target.value));

                $("#startYearPicker").empty();

                newStartYears.forEach(element => {
                    if (element.value === currentStartYear) {
                        $("#startYearPicker").append('<option value=' + element.value + ' selected="">' + element.label + '</option>');
                    } else {
                        $("#startYearPicker").append('<option value=' + element.value + '>' + element.label + '</option>');
                    }
                });

                $("#startYearPicker").selectpicker("refresh");

                temporalFiltersLabel.innerHTML = `(${startYearValue} - ${endYearValue})`
                filterParameters.updateEndYear(parseInt(e.target.value));
                queryString.updateQueryString(filterParameters);

                statisticPage.update(filterParameters);
                mapPage.update(filterParameters);
                dataPage.update(filterParameters);
            });
        }
    }
});