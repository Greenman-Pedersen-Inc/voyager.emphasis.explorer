define(
    [
        './app/Utilities.js',
        "./app/components/filterMenu/alertModal.js",
        "./app/staticData/urls.js",
    ],
    function(
        Utilities,
        alertModal,
        urls,
    ) {
        return function ReportButton(credentials) {
            this.initiate = function(filterParameters, tour) {
                $('#generateReportButton').on('click', function() {
                    checkReportParameters(filterParameters, tour);
                });
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
                        if (filterParameters.locationFilters.mun_cty_co.value === null) {
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
                    if (filterParameters.locationFilters.mun_cty_co.value === null) {
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
                const requestParams = filterParameters.createPayloadRequest();
                const headers = {
                    headers: {
                        token: credentials.token
                    }
                }
    
                // hide the message box and show the loading box
                $('#messageBox').addClass("hidden");
                $('#loadingBox').removeClass("hidden");
                $('#reportDisplay').addClass("hidden");
    
                fetch(urls.reportURL + requestParams, headers)
                .then(response => {
                    if (response.status === 200) {
                        response.json()
                        .then(data => {
                            // set the report url to the iframe
                            $('#reportDisplay').attr('src', 'https://gpi.services/reports/' + data.url);
                            $('#loadingBox').addClass("hidden");
                            $('#reportDisplay').removeClass("hidden");
                        })
                    }
                    else {
                        $('#messageBox').removeClass("hidden");
                        $('#loadingBox').addClass("hidden");
                        $('#reportDisplay').addClass("hidden");
                        alertModal.showModal("There was an issue generating your report. Please try again or contact the admin for support at admin@njvoyager(.)com.");
                    }
                })
                .catch(Utilities.errorHandler(error));
            }
        }
    });