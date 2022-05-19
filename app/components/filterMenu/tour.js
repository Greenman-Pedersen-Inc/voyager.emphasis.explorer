define([], function () {
    // Instance the tour
    return function TourHelper() {
        var self = this;
        this.initiate = function () {
            self.tour.init();

            $('#tourButton').on('click', function () {
                startTour(true);
            });
        }

        this.isTourEnded = function() {
            return (self.tour.ended());
        }

        this.tour = new Tour({
            orphan: true,
            backdrop: true,
            onHidden: function (tour) { $("#backdropFallback").removeClass("hidden"); },
            onShown: function (tour) { $("#backdropFallback").addClass("hidden"); },
            onEnd: function (tour) { $("#backdropFallback").addClass("hidden"); },
            steps: [
                {
                    title: "Welcome to the Sun Glare Module!",
                    content: "This tutorial will go through the basic workflow to filter sun glare crashes and generate summary reports based on sun glare and location filters."
                },
                {
                    element: "#sunGlareConditionsCard",
                    title: "Sunglare Conditions",
                    content: "Select at least one sun glare condition to query crashes with your selection. Each crash consists of only one condition.",
                    onNext: function () {
                        showAccordian('sunGlareHeader', false);
                        showAccordian('reportType', true);
                    }
                },
                {
                    element: "#locationFiltersCard",
                    title: "Location Filters",
                    content: "Select one of the three report types to generate a report on. \
                        The report will provide statstics on Person's Physical Conditions for SRI and mileposts based on your selected conditions and report parameters from the next step.\
                        <br/><br/>Hover the '?' icons to view additional details about each report type.",
                    onPrev: function () {
                        showAccordian('reportType', false);
                        showAccordian('sunGlareHeader', true);
                    },
                    onNext: function () {
                        showAccordian('reportType', false);
                        showAccordian('paramsHeader', true);
                    }
                },
                {
                    element: "#reportParametersCard",
                    title: "Report Parameters",
                    content: "Select the crash years and sorting method for the report. The report will query crashes based on these report parameters and selected conditions.",
                    onPrev: function () {
                        showAccordian('paramsHeader', false);
                        showAccordian('reportType', true);
                    },
                    onNext: function () {
                        showAccordian('paramsHeader', false);
                        showAccordian('attributesHeader', true);
                    }
                },
                {
                    element: "#crashAttributesCard",
                    title: "Additional Statistics Tables",
                    content: "Select any number of crash attributes to generate additional statistics tables for each selected attribute.",
                    onPrev: function () {
                        showAccordian('attributesHeader', false);
                        showAccordian('paramsHeader', true);
                    },
                    onNext: function () {
                        document.getElementById('StatisticsPill').click();
                    }
                },
                {
                    element: "#statisticsColumn",
                    title: "Statistics",
                    content: "Statistics on sun-glare related crashes will be here. The tables and charts automatically update when filters are selected. \
                    <br /><br /> Charts can be downloaded as an image or CSV by clicking the '≡' button.",
                    autoscroll: false,
                    placement: "left",
                    onPrev: function () {
                        showAccordian('sunGlareHeader', false);
                        showAccordian('attributesHeader', true);
                    },
                    onNext: function () {
                        document.getElementById('MapPill').click();
                    }
                },
                {
                    element: "#mapColumn",
                    title: "Map",
                    content: "Crashes based on the selected filters will appear here. When clicking on a crash, a popup will appear which contains details about the crash. \
                    <br /><br />Additionally, a sun dial will appear which shows the sun's trajectory based on the date and time the crash occured.",
                    autoscroll: false,
                    placement: "left",
                    onPrev: function () {
                        document.getElementById('StatisticsPill').click();
                    },
                    onShown: function () {
                    }
                },
                {
                    element: "#sunDialControls",
                    title: "Sun Dial Controls",
                    content: "The sun dial's date and time parameters can also be adjusted using these sliders.",
                    autoscroll: false,
                    placement: "bottom",
                },
                {
                    element: "#basemapButton",
                    title: "Basemap Toggle",
                    content: "Toggle the Street or Satellite map layer here.",
                    autoscroll: false,
                    placement: "left",
                },
                {
                    element: "#generateDiv",
                    title: "Selected Parameters & Report Generation",
                    content: "Your filter selections will be summarized here. \
                    <br /><br />Click the 'Generate Report' button to preview your report. \
                    <br /><br />To reset this form, click the ↻ button.",
                    autoscroll: false,
                    placement: "top",
                    onPrev: function () {
                        showAccordian('sunGlareHeader', false);
                        showAccordian('attributesHeader', true);
                    },
                    onNext: function () {
                        document.getElementById('ReportPill').click();   // jump to the Report tab
                    }
                },
                {
                    element: "#reportColumn",
                    title: "Report Preview",
                    content: "Your generated report will appear here. Hover over the generated report to show zoom, print, and download options.",
                    autoscroll: false
                },
                {
                    element: "#tourButton",
                    title: "Restart Tutorial",
                    content: "Click this button to restart this tutorial.",
                    autoscroll: false
                }
            ]
        });

        function showAccordian(headerId, show) {
            if (show) {
                $('#' + headerId + '-collapse').addClass('show');
                $("#" + headerId + "-button").removeClass("filter-heading-button").addClass("filter-heading-button-selected");
                $("#" + headerId + "-arrow").removeClass("arrowIconUp").addClass("arrowIconDown");
                $("#" + headerId).removeClass("filter-heading").addClass("filter-heading-selected");
            }
            else {
                $('#' + headerId + '-collapse').removeClass('show');
                $("#" + headerId + "-button").removeClass("filter-heading-button-selected").addClass("filter-heading-button");
                $("#" + headerId + "-arrow").removeClass("arrowIconDown").addClass("arrowIconUp");
                $("#" + headerId).removeClass("filter-heading-selected").addClass("filter-heading");
            }
        }

        function startTour(forceStart) {
            // remove all other instances of filter-heading-selected
            $(".filter-heading-selected").each(function () {
                const id = $(this).attr('id');
                $("#" + id + "-button").removeClass("filter-heading-button-selected").addClass("filter-heading-button");
                $("#" + id + "-arrow").removeClass("arrowIconDown").addClass("arrowIconUp");
                $(this).removeClass("filter-heading-selected").addClass("filter-heading");
                $('#' + id + '-collapse').removeClass('show');
            });
            showAccordian('sunGlareHeader', true);
            // Start the tour
            self.tour.setCurrentStep(0);
            self.tour.start(forceStart);
        }
    }
})