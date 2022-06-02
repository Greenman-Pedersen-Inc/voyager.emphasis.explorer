define(['./app/staticData/urls.js', './app/components/filterMenu/queryString.js'], function (
    urls,
    queryString
) {
    return function SRIPicker(statisticsPage, mapPage, dataPage, credentials) {
        var self = this;
        this.initiate = function (filterParameters) {
            // sri picker search
            $('#sriPicker').selectpicker('refresh');

            // if sri option was selected, set the report params
            $('#sriPicker').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
                let filterAppliedText = document.getElementById('locationFiltersLabel');
                let selectedValue = this.options[this.selectedIndex].text;
                let filterText = ` (SRI${selectedValue ? ': ' + selectedValue : ''})`;

                filterAppliedText.innerHTML = filterText;
                filterParameters.updateSri(e.target[clickedIndex].text, e.target.value);
                queryString.updateQueryString(filterParameters);

                statisticsPage.update(filterParameters);
                mapPage.update(filterParameters);
                dataPage.update(filterParameters);
            });

            $('#sriPickerDiv .form-control').on('keyup', function (e) {
                // get keycode of current keypress event
                var code = e.keyCode || e.which;

                // do nothing if it's an arrow key
                if (code == 37 || code == 38 || code == 39 || code == 40) {
                    return;
                }

                const filter = {
                    searchText: this.value,
                    includeRoute: true,
                    includeCounty: false,
                    includeMunicipality: false,
                    includeCaseNumber: false,
                    includeGooglePlace: false,
                    includeGoogleAddress: false,
                };

                const headers = {
                    headers: {
                        token: credentials.token,
                    },
                };

                fetch(
                    urls.searchURL +
                        Object.keys(filter)
                            .map((key) => key + '=' + filter[key])
                            .join('&'),
                    headers
                )
                    .then((response) => {
                        // check if the response back from the server is the search that is expected
                        // from the current input in the text box.
                        if (response.status === 200) {
                            response.json().then((data) => {
                                $('#sriPicker').empty();
                                var i = data.SearchResults.length;
                                while (i--) {
                                    var sriCode = data.SearchResults[i].ResultID;
                                    var displayName = data.SearchResults[i].ResultText;
                                    $('#sriPicker').prepend(
                                        '<option value=' + sriCode + '>' + displayName + '</option>'
                                    );
                                }
                                $('#sriPicker').selectpicker('refresh');

                                const searchCount = data.SearchResults.length;
                                fetch(
                                    urls.searchCountURL +
                                        Object.keys(filter)
                                            .map((key) => key + '=' + filter[key])
                                            .join('&'),
                                    headers
                                ).then((response) => {
                                    if (response.status === 200) {
                                        response.json().then((data) => {
                                            var totalCount = data.SearchResults[0].count;
                                            if (totalCount < searchCount) {
                                                totalCount = searchCount;
                                            }
                                            var countString = searchCount + ' of ' + totalCount;
                                            $('#sriSearchCount').text('Showing ' + countString + ' results');
                                        });
                                    }
                                });
                            });
                        } else {
                            $('#sriSearchCount').text('Showing 0 of 0 results');
                        }
                    })
                    .catch(errorHandler);
            });

            $('[data-id=sriPicker] .close').click(function () {
                $('#sriSearchCount').text('Showing 0 of 0 results');
                $('#sriPicker').empty();
                $('#sriPicker').selectpicker('refresh');

                let filterAppliedText = document.getElementById('locationFiltersLabel');
                let filterText = ` (SRI)`;

                filterAppliedText.innerHTML = filterText;
                filterParameters.updateSri('', null);
                queryString.updateQueryString(filterParameters);

                statisticsPage.update(filterParameters);
                mapPage.update(filterParameters, true);
                dataPage.update(filterParameters);
            });

            function errorHandler(error) {
                console.error(error);
                if (error.httpCode === 498 || error.details.error.details.httpStatus === 498) {
                    alert('There is an issue searching for an SRI. Please refresh the page and try again.');
                }
            }
        };
    };
});
