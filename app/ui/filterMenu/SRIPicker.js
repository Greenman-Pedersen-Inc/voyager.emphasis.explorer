define([
    './app/Utilities.js',
    "./app/staticData/urls.js",
    "./app/components/filterMenu/queryString.js",
    "esri/request",
], function(
    Utilities,
    urls,
    queryString,
    esriRequest,
) {
    return function SRIPicker(statisticsPage, mapPage, dataPage) {
        var self = this;
        this.initiate = function(filterParameters, username) {
            // sri picker search
            $('#sriPicker').selectpicker('refresh');

            // if sri option was selected, set the report params
            $('#sriPicker').on('changed.bs.select', function(e, clickedIndex, isSelected, previousValue) {
                let filterAppliedText = document.getElementById('locationFiltersLabel');
                let selectedValue = this.options[this.selectedIndex].text;
                let filterText = ` (SRI${selectedValue ? ': ' + selectedValue : ''})`;

                filterAppliedText.innerHTML = filterText;
                filterParameters.updateSri(e.target[clickedIndex].text, e.target.value)
                queryString.updateQueryString(filterParameters);

                statisticsPage.update(filterParameters);
                mapPage.update(filterParameters);
                dataPage.update(filterParameters);
            });

            $('#sriPickerDiv .form-control').on('keyup', function(e) {
                // get keycode of current keypress event
                var code = (e.keyCode || e.which);

                // do nothing if it's an arrow key
                if (code == 37 || code == 38 || code == 39 || code == 40) {
                    return;
                }

                var filter = {
                    User: username,
                    SearchText: this.value,
                    IncludeRoute: true,
                    IncludeCounty: false,
                    IncludeMunicipality: false,
                    IncludeCaseNumber: false,
                    IncludeGooglePlace: false,
                    IncludeGoogleAddress: false,
                    'f': 'json'
                };

                esriRequest(urls.searchURL, { query: filter }).then(function(response) {
                    // check if the response back from the server is the search that is expected
                    // from the current input in the text box.
                    if (response.data.SearchResults === undefined) return;
                    if (response.data.SearchResults.length > 0) {
                        $("#sriPicker").empty();
                        var i = response.data.SearchResults.length;
                        while (i--) {
                            var sriCode = response.data.SearchResults[i].ResultID;
                            var displayName = response.data.SearchResults[i].ResultText;
                            $("#sriPicker").prepend('<option value=' + sriCode + '>' + displayName + '</option>');
                        }
                        $('#sriPicker').selectpicker('refresh');

                        const searchCount = response.data.SearchResults.length;
                        esriRequest(urls.searchCountURL, { query: filter }).then(function(count) {
                            var totalCount = count.data.SearchResultsCount;
                            if (totalCount < searchCount) {
                                totalCount = searchCount;
                            }
                            var countString = searchCount + " of " + totalCount;
                            $("#sriSearchCount").text("Showing " + countString + " results");
                        });
                    } else {
                        $("#sriSearchCount").text("Showing 0 of 0 results");
                    }
                }, Utilities.errorHandler);
            });

            $('[data-id=sriPicker] .close').click(function() {
                $("#sriSearchCount").text("Showing 0 of 0 results");
                $("#sriPicker").empty();
                $('#sriPicker').selectpicker('refresh');

                let filterAppliedText = document.getElementById('locationFiltersLabel');
                let filterText = ` (SRI)`;

                filterAppliedText.innerHTML = filterText;
                filterParameters.updateSri("", null)
                queryString.updateQueryString(filterParameters);

                statisticsPage.update(filterParameters);
                mapPage.update(filterParameters, true);
                dataPage.update(filterParameters);
            });
        }
    }
})