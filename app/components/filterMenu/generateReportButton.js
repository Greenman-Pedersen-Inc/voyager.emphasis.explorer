define(
    [
        './app/Utilities.js',
        "./app/components/filterMenu/alertModal.js",
        "./app/staticData/urls.js",
        "esri/request",
    ],
    function(
        Utilities,
        alertModal,
        urls,
        esriRequest,
    ) {
        return function ReportButton() {
            this.initiate = function(filterParameters, tour) {
                $('#generateReportButton').on('click', function() {
                    checkReportParameters(filterParameters, tour);
                });
            }
        }

        function checkReportParameters(filterParameters, tour) {
            // if the tour is not running, show the alert modal
            if (tour.isTourEnded()) {
                if (filterParameters.summary.value === "sri-summary") {
                    if (filterParameters.locationFilters.sri.value === null) {
                        // if the tour is not running, show the alert modal
                        if (tour.isTourEnded()) {
                            alertModal.showModal("Please select an SRI.");
                        }
                    }
                } else if (filterParameters.summary.value === "loc-summary") {
                    if (filterParameters.locationFilters.cty_code.value === null) {
                        // if the tour is not running, show the alert modal
                        if (tour.isTourEnded()) {
                            alertModal.showModal("Please select a county.");
                        }
                    }
                }
            }

            if (filterParameters.summary.value === "sri-summary") {
                if (filterParameters.locationFilters.sri.value === null) {
                    // if the tour is not running, show the alert modal
                    if (tour.isTourEnded()) {
                        alertModal.showModal("Please select an SRI.");
                        // open locations section
                        if (!$('#reportType-button').hasClass('filter-heading-button-selected')) {
                            $('#reportType-button').click().change();
                        }
                    }
                    return;
                }
            } else if (filterParameters.summary.value === "loc-summary") {
                if (filterParameters.locationFilters.cty_code.value === null) {
                    // if the tour is not running, show the alert modal
                    if (tour.isTourEnded()) {
                        alertModal.showModal("Please select a county.");
                        // open locations section
                        if (!$('#reportType-button').hasClass('filter-heading-button-selected')) {
                            $('#reportType-button').click().change();
                        }
                    }
                    return;
                }
            }

            document.getElementById('ReportPill').click(); // jump to the Report tab
            pushReportGeneration(filterParameters);
        }

        function pushReportGeneration(filterParameters) {
            var requestParams = filterParameters.createPayloadRequest();

            // hide the message box and show the loading box
            $('#messageBox').addClass("hidden");
            $('#loadingBox').removeClass("hidden");
            $('#reportDisplay').addClass("hidden");

            esriRequest(urls.reportURL, { query: requestParams }).then(function(response) {
                if (response.data.ReportAddress === undefined) return;
                if (response.data.ReportAddress) {
                    // set the report url to the iframe
                    $('#reportDisplay').attr('src', response.data.ReportAddress);
                    $('#loadingBox').addClass("hidden");
                    $('#reportDisplay').removeClass("hidden");
                } else {
                    $('#messageBox').removeClass("hidden");
                    $('#loadingBox').addClass("hidden");
                    $('#reportDisplay').addClass("hidden");
                    alertModal.showModal("There was an issue generating your report. Please try again or contact the admin for support at admin@njvoyager(.)com.");
                }
            }, Utilities.errorHandler);
        }
    });