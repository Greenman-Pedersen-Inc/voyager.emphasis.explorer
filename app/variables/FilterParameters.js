define([
    "./app/staticData/year.js",
], function(yearHelper) {
    function FilterParameters(startValue, startLabel) {
        var self = this;
        this.summary = { title: "Location Filter", label: "New Jersey State Summary", value: "nj-summary" };

        // attribute names should match the service's parameter names
        this.User = null;
        this.category = { title: "Emphasis Area", label: startLabel, value: startValue };
        this.subCategory = { title: "Sub-Category", label: "", value: null };

        this.temporalFilters = {
            yearFilters: {
                title: "Crash Years",
                startYear: yearHelper.getDefaultStartYear(),
                endYear: yearHelper.getDefaultEndYear(),
                label: yearHelper.getDefaultStartYear() + "-" + yearHelper.getDefaultEndYear()
            }
        };

        this.locationFilters = {
            sri: { label: "", value: null },
            mun_cty_co: { label: "", value: null },
            mun_mu: { label: "", value: null },
        };

        this.reportParameters = {
            crashAttributes: { title: "Additional Report Tables", labels: [], values: [] },
            sort: { title: "Report Sort Method", label: "Crash Count", value: "crash-sort" }
        }

        this.f = 'json';
        this.isResetting = false;

        // !=== CLASS FUNCTIONS ===!
        this.setUser = function(username) {
            self.User = username;
        }

        this.updateSummary = function(value) {
            self.summary.value = value;
            self.updateLabels();
        }

        this.updateCategory = function(value, subValue) {
            self.category.value = value;

            if (subValue) {
                self.subCategory.value = subValue;
    
                if (self.subCategory.value == "drowsy_distracted") {
                    self.subCategory.label = "Drowsy/Distracted";
                } else if (self.subCategory.value == "heavy_vehicle") {
                    self.subCategory.label = "Heavy Vehicle";
                } else if (self.subCategory.value == "younger") {
                    self.subCategory.label = "Younger Driver";
                } else if (self.subCategory.value == "mature") {
                    self.subCategory.label = "Mature Driver";
                } else if (self.subCategory.value == "work_zone") {
                    self.subCategory.label = "Work Zone";
                } else {
                    self.subCategory.label = capitalizeFirstLetter(subValue);
                }
            } else {
                self.subCategory.value = null;
                self.subCategory.label = null;
    
                if (value) {
                    if (value === 'ped_cyclist') {
                        self.category.label = 'Pedestrian & Cyclists';
                    } else if (value === 'lane_departure') {
                        self.category.label = 'Lane Departure';
                    } else {
                        self.category.label = capitalizeFirstLetter(value);
                    }
                }
            }

            self.updateLabels();
        }

        //#region TEMPORAL FILTERS
        this.updateStartYear = function(startYear) {
            self.temporalFilters.yearFilters.startYear = startYear;
            self.updateYearLabel();
            console.log(self);
        }

        this.updateEndYear = function(endYear) {
            self.temporalFilters.yearFilters.endYear = endYear;
            self.updateYearLabel();
            console.log(self);
        }

        this.getStartYear = function() {
            return self.temporalFilters.yearFilters.startYear;
        }

        this.getEndYear = function() {
            return self.temporalFilters.yearFilters.endYear;
        }

        this.updateYearLabel = function() {
                var yrFilter = self.temporalFilters.yearFilters;
                yrFilter.label = yrFilter.startYear + "-" + yrFilter.endYear;
                console.log(self);

            }
            //#endregion TEMPORAL FILTERS

        //#region LOCATION FILTERS
        this.updateSri = function(label, value) {
            self.locationFilters.sri.label = label;
            self.locationFilters.sri.value = value;
            self.updateLabels();
        }
        this.updateCounty = function(label, value) {
            self.locationFilters.mun_cty_co.label = label;
            self.locationFilters.mun_cty_co.value = value;
            self.updateLabels();
        }
        this.updateMuni = function(label, value) {
            self.locationFilters.mun_mu.label = label;
            self.locationFilters.mun_mu.value = value;
            self.updateLabels();
        }
        this.updateMPO = function(label, value) {
            self.locationFilters.mun_cty_co.label = label;
            self.locationFilters.mun_cty_co.value = value;
            self.updateLabels();
        }
        this.hasLocation = function() {
                return self.locationFilters.sri.value || self.locationFilters.mun_cty_co.value || self.locationFilters.mun_mu.value;
            }
            //#endregion LOCATION FILTERS

        //#region REPORT PARAMETERS
        this.updateCrashAttribute = function(labels, value) {
            self.reportParameters.crashAttributes.labels = labels;
            self.reportParameters.crashAttributes.value = value;
            console.log(self);
        }

        this.updateSort = function(label, value) {
                self.reportParameters.sort.label = label;
                self.reportParameters.sort.value = value;
                console.log(self);
            }
            //#endregion REPORT PARAMETERS

        //#region RESET
        this.isFiltersResetting = function(isReset) {
            self.isResetting = isReset;
            console.log(self);
        }

        this.reset = function(username) {
                resetFilterForm();
                // var resettedFilters = new FilterParameters();
                self.setUser(username);
                self.isFiltersResetting(false);
                // return resettedFilters;
            }
            //#endregion RESET

        //#region UPDATE LABELS
        this.updateLabels = function() {
                if (self.summary.value === "nj-summary") {
                    self.summary.label = "New Jersey State Summary";
                } else if (self.summary.value === "loc-summary") {
                    self.summary.label = "County & Municipality Summary";
                } else if (self.summary.value === "mpo-summary") {
                    self.summary.label = "MPO";
                } else if (self.summary.value === "sri-summary") {
                    self.summary.label = "SRI Summary";
                }
            }
            //#endregion UPDATE LABELS

        this.createPayloadRequest = function() {
            var requestParams = {
                category: self.category.value,
                subCategory: self.subCategory.value,
                startYear: self.temporalFilters.yearFilters.startYear,
                endYear: self.temporalFilters.yearFilters.endYear,
                sri: self.locationFilters.sri.value,
                mun_cty_co: self.locationFilters.mun_cty_co.value,
                mun_mu: self.locationFilters.mun_mu.value,
            }
    
            if (self.summary.value === "sri-summary") {
                // remove the cty and muni attributes
                delete requestParams.countyCode;
                delete requestParams.muniCode;
            } else if (self.summary.value === "loc-summary") {
                delete requestParams.sri;
            } else if (self.summary.value === "nj-summary") {
                delete requestParams.countyCode;
                delete requestParams.muniCode;
                delete requestParams.sri;
            }
    
            for (const [key, value] of Object.entries(requestParams)) {
                if (value === '' || value === null || value === undefined) delete requestParams[key];
            }
    
            return requestParams;
        }

        function resetFilterForm() {
            $("#startYearPicker").selectpicker('val', yearHelper.getDefaultStartYear().toString());
            $("#endYearPicker").selectpicker('val', yearHelper.getDefaultEndYear().toString());

            $('[data-id=countyPicker] .close').click().change();
            $('[data-id=muniPicker] .close').click().change();

            $("#nj-summary").prop("checked", true).change();

            $("#countyPicker").val('default');
            $("#countyPicker").selectpicker("refresh");

            $("#muniPicker").empty();
            $("#muniPicker").prop("disabled", true);
            $(".selectpicker[data-id='muniPicker']").addClass("disabled");
            $("#muniPicker").val('default').selectpicker("refresh");

            $("#sriPicker").val('default');
            $("#sriPicker").selectpicker("refresh");
        }

    }

    return FilterParameters;

});