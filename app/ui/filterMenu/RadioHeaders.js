define([
    "./app/components/filterMenu/queryString.js"
], function(
    queryString
) {
    return function RadioHeaders(statisticPage, mapPage, dataPage) {
        function processUpdate(mapFilter, filterParameters, labelToUpdate, labelText) {
            labelToUpdate.innerHTML = labelText;
            mapFilter.update(undefined, filterParameters);
            statisticPage.update(filterParameters);
            dataPage.update(filterParameters);
        }

        this.initiate = function(filterParameters) {
            let emphasisAreaSelectionLabel = document.getElementById('emphasisAreaSelectionLabel');
            let locationFiltersLabel = document.getElementById('locationFiltersLabel');

            $(document).on('change', 'input:radio[id="sri-summary"]', function(event) {
                let sriPicker = document.getElementById('sriPicker');
                let selectedText = sriPicker.options[sriPicker.selectedIndex].text;
                let selectedValue = sriPicker.options[sriPicker.selectedIndex].value;
                let filterText = ` (SRI${selectedValue ? ': ' + selectedValue : ''})`;

                configureRadioSelect('sri-summary', filterParameters);
                filterParameters.updateSummary('sri-summary');
                queryString.updateQueryString(filterParameters);

                if (selectedValue) {
                    locationFiltersLabel.innerHTML = filterText;
                    filterParameters.updateSri(selectedText, selectedValue)
                    queryString.updateQueryString(filterParameters);

                    statisticPage.update(filterParameters);
                    dataPage.update(filterParameters);
                    mapPage.update(filterParameters);
                } else {
                    locationFiltersLabel.innerHTML = ' (Select SRI...)';
                    filterParameters.updateSri("", null)
                    filterParameters.updateCounty("", null);
                    filterParameters.updateMuni("", null);
                    queryString.updateQueryString(filterParameters);

                    // statisticPage.update(filterParameters);
                    // dataPage.update(filterParameters);
                    // mapPage.update(filterParameters);
                }
            });

            $(document).on('change', 'input:radio[id="loc-summary"]', function(event) {
                let muniPicker = document.getElementById('muniPicker');
                let countyPicker = document.getElementById('countyPicker');

                let countySelectedText = countyPicker.options[countyPicker.selectedIndex].text;
                let countySelectedValue = countyPicker.options[countyPicker.selectedIndex].value;
                let muniSelectedText = muniPicker.options[muniPicker.selectedIndex].text;
                let muniSelectedValue = muniPicker.options[muniPicker.selectedIndex].value.slice(2);

                if (countySelectedText && muniSelectedText) {
                    locationFiltersLabel.innerHTMLText = ` (${countySelectedText}, ${muniSelectedText})`
                } else if (countySelectedText) {
                    locationFiltersLabel.innerHTML = ` (${countySelectedText})`
                } else {
                    locationFiltersLabel.innerHTML = ` (Select Jurisdiction...)`
                }
                // map.toggleSriLayer(filterParameters, false);
                filterParameters.updateSri("", null)

                configureRadioSelect('loc-summary', filterParameters);
                filterParameters.updateSummary('loc-summary');
                queryString.updateQueryString(filterParameters);

                if (muniSelectedValue && countySelectedValue) {
                    filterParameters.updateCounty(countySelectedText, countySelectedValue);
                    filterParameters.updateMuni(muniSelectedText, muniSelectedValue);
                    queryString.updateQueryString(filterParameters);

                    statisticPage.update(filterParameters);
                    mapPage.update(filterParameters);
                    dataPage.update(filterParameters);
                } else if (countySelectedValue) {
                    filterParameters.updateCounty(countySelectedText, countySelectedValue);
                    filterParameters.updateMuni("", null);
                    queryString.updateQueryString(filterParameters);

                    statisticPage.update(filterParameters);
                    mapPage.update(filterParameters);
                    dataPage.update(filterParameters);
                } else {
                    filterParameters.updateCounty("", null);
                    filterParameters.updateMuni("", null);
                    queryString.updateQueryString(filterParameters);

                    // mapPage.update(filterParameters);
                    // statisticPage.update(filterParameters);
                    // dataPage.update(filterParameters);
                }
            });

            $(document).on('change', 'input:radio[id="nj-summary"]', function(event) {
                filterParameters.updateSri('', null)
                filterParameters.updateCounty('', null);
                filterParameters.updateMuni('', null);
                filterParameters.updateSummary('nj-summary');

                locationFiltersLabel.innerHTML = ` (New Jersey State)`;
                configureRadioSelect('nj-summary', filterParameters);
                queryString.updateQueryString(filterParameters);

                statisticPage.update(filterParameters);
                mapPage.update(filterParameters);
                dataPage.update(filterParameters);
            });

            $(document).on('change', 'input:radio[id="mpo-summary"]', function(event) {
                let mpoPicker = document.getElementById('mpoPicker');
                let selectedText = mpoPicker.options[mpoPicker.selectedIndex].text;
                let selectedValue = mpoPicker.options[mpoPicker.selectedIndex].value;

                filterParameters.updateSri("", null)
                filterParameters.updateMuni("", null);

                configureRadioSelect('mpo-summary', filterParameters);

                if (selectedText) {
                    locationFiltersLabel.innerHTML = ` (${selectedText})`;
                } else {
                    locationFiltersLabel.innerHTML = ' (Select MPO...)';
                }

                filterParameters.updateSummary('mpo-summary');

                if (selectedValue) {
                    filterParameters.updateMPO(selectedText, selectedValue);
                    queryString.updateQueryString(filterParameters);

                    statisticPage.update(filterParameters);
                    mapPage.update(filterParameters);
                    dataPage.update(filterParameters);
                } else {
                    filterParameters.updateMPO("", null);
                    queryString.updateQueryString(filterParameters);

                    // statisticPage.update(filterParameters);
                    // mapPage.update(filterParameters);
                    // dataPage.update(filterParameters);
                }
            });

            $(document).on('change', 'input:radio[name="eaRadio"]', function(event) {
                let splitID = event.currentTarget.id.split("-");
                let value = event.currentTarget.value;
                let labelElement = document.querySelector("label[for=" + event.currentTarget.id + "]");
                let labelText = (labelElement.innerText || labelElement.textContent).replace(/\s{2,}/g, '');

                emphasisAreaSelectionLabel.innerHTML = ` (${labelText})`

                if (splitID.length > 1) {
                    filterParameters.updateCategory(splitID[0], value);
                } else {
                    filterParameters.updateCategory(value);
                }

                queryString.updateQueryString(filterParameters);

                mapPage.update(filterParameters, true);
                statisticPage.update(filterParameters);
                dataPage.update(filterParameters);
            });
        }

        function configureRadioSelect(id, filterParameters) {
            // remove disabled class from the mpo picker
            $("#mpoSelectDiv").addClass("div-disabled");
            $("#mpoPicker").attr("disabled", true);
            $("#mpoPicker").selectpicker("refresh");

            // remove disabled class from the SRI picker
            $("#sriSelectDiv").addClass("div-disabled");
            $("#sriPicker").attr("disabled", true);
            $("#sriPicker").selectpicker("refresh");

            // add the disabled class to the County and Muni pickers
            $("#sriSelectDiv").addClass("div-disabled");
            $("#locationSelectDiv").addClass("div-disabled");

            $("#countyPicker").attr("disabled", true);
            $("#countyPicker").selectpicker("refresh");

            $("#muniPicker").attr("disabled", true);
            $("#muniPicker").selectpicker("refresh");

            // enable milepost sort option
            $("#mp-sort").attr("disabled", true);
            $("#mpRadio").removeClass("disabled");

            if (id === "mpo-summary") {
                // remove disabled class from the mpo picker
                $("#mpoSelectDiv").removeClass("div-disabled");
                $("#mpoPicker").attr("disabled", false);
                $("#mpoPicker").selectpicker("refresh");
            } else if (id === "sri-summary") {
                // remove disabled class from the SRI picker
                $("#sriSelectDiv").removeClass("div-disabled");
                $("#sriPicker").attr("disabled", false);
                $("#sriPicker").selectpicker("refresh");
            } else if (id === "loc-summary") {
                // remove the disabled class to the County and Muni pickers
                $("#locationSelectDiv").removeClass("div-disabled");
                $("#countyPicker").attr("disabled", false);
                $("#countyPicker").selectpicker("refresh");

                if ($("#countyPicker").val()) {
                    $("#muniPicker").attr("disabled", false);
                    $("#muniPicker").selectpicker("refresh");
                }
            }

            // set the option in report params. this is used to check picker options were selected or not
            filterParameters.updateSummary(id);
        }
    }
});