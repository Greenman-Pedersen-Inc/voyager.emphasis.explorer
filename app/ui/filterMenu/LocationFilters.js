define([
    "./app/staticData/county.js",
    "./app/staticData/municipality.js",
    "./app/components/filterMenu/queryString.js",
    "./app/ui/filterMenu/SRIPicker.js"
], function(
    countyHelper,
    muniHelper,
    queryString,
    SRIPicker
) {
    return function LocationFilters(statisticsPage, mapPage, dataPage, credentials) {
        this.initiate = function(filterParameters, userInfo) {
            const mpos = countyHelper.getMpos();
            const counties = countyHelper.getCounties();
            const filterAppliedText = document.getElementById('locationFiltersLabel');
            const muniPicker = document.getElementById('muniPicker');
            const countyPicker = document.getElementById('countyPicker');

            let sriPicker = new SRIPicker(statisticsPage, mapPage, dataPage, credentials);

            mpos.forEach(element => {
                $("#mpoPicker").append('<option value=\'' + element.value + '\'>' + element.label + '</option>');
            });
            $("#mpoPicker").selectpicker("refresh");
            // mpo select box handler
            $('#mpoPicker').on('changed.bs.select', function(e, clickedIndex, isSelected, previousValue) {
                if (e.target.value === null) {
                    return
                } else {
                    let selectedText = this.options[this.selectedIndex].text;
                    let selectedValue = this.options[this.selectedIndex].value;

                    if (selectedText) {
                        filterAppliedText.innerHTML = ` (${selectedText})`;
                    } else {
                        filterAppliedText.innerHTML = ' (Select MPO...)';
                    }

                    // update the query text
                    filterParameters.updateMPO(selectedText, selectedValue);
                    filterParameters.updateMuni("", null);
                    queryString.updateQueryString(filterParameters);

                    statisticsPage.update(filterParameters);
                    mapPage.update(filterParameters);
                    dataPage.update(filterParameters);
                }

            });
            // MPO picker cleared
            $('[data-id=mpoPicker] .close').click(function() {
                filterAppliedText.innerHTML = ` (Select MPO...)`;

                $('#mpoPicker').val('default');
                $('#mpoPicker').selectpicker('refresh');

                filterParameters.updateMPO("", null);
                filterParameters.updateMuni("", null);
                queryString.updateQueryString(filterParameters);

                statisticsPage.update(filterParameters);
                mapPage.update(filterParameters);
                dataPage.update(filterParameters);
            });

            counties.forEach(element => {
                $("#countyPicker").append('<option value=\'' + element.value + '\'>' + element.label + '</option>');
            });
            // Refresh the selectpicker to show the options
            $("#countyPicker").selectpicker("refresh");
            // if a county selection was made, update the municipality select box
            $('#countyPicker').on('changed.bs.select', function(e, clickedIndex, isSelected, previousValue) {
                //search for all muni using this county code
                if (e.target.value === null) {
                    return
                } else {
                    let countySelectedText = countyPicker.options[countyPicker.selectedIndex].text;
                    let countySelectedValue = countyPicker.options[countyPicker.selectedIndex].value;
                    let filteredMunis = muniHelper.filterMunicipalities(countySelectedValue);

                    if (countySelectedText) {
                        filterAppliedText.innerHTML = ` (${countySelectedText})`;
                    } else {
                        filterAppliedText.innerHTML = ' (Select Jurisdiction...)';
                    }

                    $("#muniPicker").prop("disabled", false);
                    $(".selectpicker[data-id='muniPicker']").removeClass("disabled");

                    $("#muniPicker").empty();

                    filteredMunis.forEach(element => {
                        $("#muniPicker").append('<option value="' + element.value + '">' + element.label + '</option>');
                    });
                    $("#muniPicker").selectpicker("refresh");

                    filterParameters.updateCounty(countySelectedText, countySelectedValue);
                    filterParameters.updateMuni("", null);
                    queryString.updateQueryString(filterParameters);

                    statisticsPage.update(filterParameters);
                    mapPage.update(filterParameters);
                    dataPage.update(filterParameters);
                }
            });
            // if a county selection was cleared, update the municipality select box
            $('[data-id=countyPicker] .close').click(function() {
                filterAppliedText.innerHTML = ' (Select Jurisdiction...)';

                $('#countyPicker').val('default');
                $('#countyPicker').selectpicker('refresh');

                $("#muniPicker").empty();
                $("#muniPicker").prop("disabled", true);
                $(".selectpicker[data-id='muniPicker']").addClass("disabled");
                $("#muniPicker").val('default').selectpicker("refresh");

                filterParameters.updateCounty("", null);
                filterParameters.updateMuni("", null);
                queryString.updateQueryString(filterParameters);

                statisticsPage.update(filterParameters);
                mapPage.update(filterParameters)
                dataPage.update(filterParameters);
            });

            // set report param muni code if selected
            $('#muniPicker').on('changed.bs.select', function(e, clickedIndex, isSelected, previousValue) {
                let countySelectedText = countyPicker.options[countyPicker.selectedIndex].text;
                let countySelectedValue = countyPicker.options[countyPicker.selectedIndex].value;
                let muniSelectedText = muniPicker.options[muniPicker.selectedIndex].text;
                let muniSelectedValue = muniPicker.options[muniPicker.selectedIndex].value.slice(2);

                if (countySelectedText && muniSelectedText) {
                    filterAppliedText.innerHTML = ` (${countySelectedText}, ${muniSelectedText})`
                } else if (countySelectedText) {
                    filterAppliedText.innerHTML = ` (${countySelectedText})`
                } else {
                    filterAppliedText.innerHTML = ` (Select Jurisdiction...)`
                }

                filterParameters.updateCounty(countySelectedText, countySelectedValue);
                filterParameters.updateMuni(muniSelectedText, muniSelectedValue);
                queryString.updateQueryString(filterParameters);

                statisticsPage.update(filterParameters);
                mapPage.update(filterParameters);
                dataPage.update(filterParameters);
            });
            // municipality was cleared
            $('[data-id=muniPicker] .close').click(function() {
                let countySelectedText = countyPicker.options[countyPicker.selectedIndex].text;
                let countySelectedValue = countyPicker.options[countyPicker.selectedIndex].value;

                if (countySelectedText) {
                    filterAppliedText.innerHTML = ` (${countySelectedText})`
                } else {
                    filterAppliedText.innerHTML = ` (Select Jurisdiction...)`
                }

                filterParameters.updateCounty(countySelectedText, countySelectedValue);
                filterParameters.updateMuni("", null);
                queryString.updateQueryString(filterParameters);

                statisticsPage.update(filterParameters);
                mapPage.update(filterParameters);
                dataPage.update(filterParameters);
            });

            sriPicker.initiate(filterParameters, userInfo);
        }
    }
})