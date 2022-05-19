define([
    "./app/staticData/sunGlareConditions.js",
    "./app/components/filterMenu/filterCheckbox.js",
    "./app/components/filterMenu/queryString.js",
], function(
    sunGlareConditions,
    checkboxHelper,
    queryString
) {
    return function SunGlareConditions() {
        var self = this;
        this.travelDirectionCodes = [];
        this.timeOfDayCodes = [];
        
        this.initiate = function (mapFilter, filterParameters, statisticsPage) {
            let direction = sunGlareConditions.getVehicleDirections();
            let hours = sunGlareConditions.getHoursOfDay();
            let attributes = sunGlareConditions.getSignzalizedIntersectionAttributes();
            
            direction.forEach(element => {
                var checkboxId = checkboxHelper.addCheckbox('vehicle-direction-items', element.label, element.value);
                mapFilter.directionFilters.push(checkboxId);
    
                $('#' + checkboxId).change(function (e) {
                    handleCondition(element.value, this.checked, element.label, filterParameters, "travelDirectionCodes");
                    if (!filterParameters.isResetting) {
                        mapFilter.update();
                        statisticsPage.update(filterParameters);
                    }                
                });
            });
    
            hours.forEach(element => {
                var checkboxId = checkboxHelper.addCheckbox('time-of-day-items', element.label, element.value);
                mapFilter.hoursFilters.push(checkboxId);
    
                $('#' + checkboxId).change(function (e) {
                    handleCondition(element.value, this.checked, element.label, filterParameters, "timeOfDayCodes");
                    if (!filterParameters.isResetting) {
                        mapFilter.update();
                        statisticsPage.update(filterParameters);
                    }          
                });
            });
    
            attributes.forEach(element => {
                var checkboxId = checkboxHelper.addCheckbox('signalized-intersection-items', element.label, element.attribute);
                mapFilter.attributeFilters.push(checkboxId);
    
                $('#' + checkboxId).change(function (e) {
                    handleCondition(element.attribute, this.checked, element.label, filterParameters, "signalizedIntersectionCodes");
                    if (!filterParameters.isResetting) {
                        mapFilter.update();
                        statisticsPage.update(filterParameters);
                    }
                });
            });
        }

        function handleCondition(value, checked, label, filterParameters, variableList) {
            if (checked) {
                if (variableList === "travelDirectionCodes") {
                    if (filterParameters.sunglareParameters.travelDirectionCodes.values.indexOf(value) === -1) {
                        filterParameters.sunglareParameters.travelDirectionCodes.values.push(value);
                        filterParameters.sunglareParameters.travelDirectionCodes.labels.push(label);
                    }
                }
                else if (variableList === "timeOfDayCodes") {
                    filterParameters.sunglareParameters.timeOfDayCodes.values.push(value);
                    filterParameters.sunglareParameters.timeOfDayCodes.labels.push(label);
                }
                else if (variableList === "signalizedIntersectionCodes") {
                    filterParameters.sunglareParameters.signalizedIntersectionCodes.values.push(value);
                    filterParameters.sunglareParameters.signalizedIntersectionCodes.labels.push(label);
                }
            }

            else {
                if (variableList === "travelDirectionCodes") {
                    for (var i = filterParameters.sunglareParameters.travelDirectionCodes.values.length - 1; i >= 0; i--) {
                        if (filterParameters.sunglareParameters.travelDirectionCodes.values[i] === value) {
                            filterParameters.sunglareParameters.travelDirectionCodes.values.splice(i, 1);
                            filterParameters.sunglareParameters.travelDirectionCodes.labels.splice(i, 1);
                            break;
                        }
                    }
                }

                else if (variableList === "timeOfDayCodes") {
                    for (var i = filterParameters.sunglareParameters.timeOfDayCodes.values.length - 1; i >= 0; i--) {
                        if (filterParameters.sunglareParameters.timeOfDayCodes.values[i] === value) {
                            filterParameters.sunglareParameters.timeOfDayCodes.values.splice(i, 1);
                            filterParameters.sunglareParameters.timeOfDayCodes.labels.splice(i, 1);
                            break;
                        }
                    }
                }

                else if (variableList === "signalizedIntersectionCodes") {
                    for (var i = filterParameters.sunglareParameters.signalizedIntersectionCodes.values.length - 1; i >= 0; i--) {
                        if (filterParameters.sunglareParameters.signalizedIntersectionCodes.values[i] === value) {
                            filterParameters.sunglareParameters.signalizedIntersectionCodes.values.splice(i, 1);
                            filterParameters.sunglareParameters.signalizedIntersectionCodes.labels.splice(i, 1);
                            break;
                        }
                    }
                }
            }

            queryString.updateQueryString(filterParameters);
    
            console.log("Sunglare Conditions: ");
            console.log(filterParameters);    
        }
    }
});