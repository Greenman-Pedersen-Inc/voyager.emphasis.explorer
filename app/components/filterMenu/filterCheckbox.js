define(
    [
        "./app/components/filterMenu/queryString.js",
    ], function (
        queryString,
    ) {

    // checkbox maker as DOM
    
    function addCheckbox(containerId, label, value) {
        var idString = `${containerId}-${value}-checkbox`;
        var divString = '<div class="form-check">';
        var inputString = '<input id="' + idString + '" class="form-check-input" type="checkbox" value="' + value + '">';
        var labelString = '<label class="form-check-label" for="' + idString + '">';
        var checkboxString = divString + inputString + labelString + label + '</label></input></div>';
        var $chk = $(checkboxString);
        $("#" + containerId).append($chk);
        return idString;
    }

    function handleCondition(value, checked, label, reportParams, queryParams, variableList) {
        if (checked) {
            if (variableList === "travelDirectionCodes") {
                if (reportParams.sunglareParameters.travelDirectionCodes.values.indexOf(value) === -1) {
                    reportParams.sunglareParameters.travelDirectionCodes.values.push(value);
                    queryParams.sunglareParameters.travelDirectionCodes.labels.push(label);
                }
            }
            else if (variableList === "timeOfDayCodes") {
                reportParams.sunglareParameters.timeOfDayCodes.values.push(value);
                queryParams.sunglareParameters.timeOfDayCodes.labels.push(label);
            }
            else if (variableList === "signalizedIntersectionCodes") {
                reportParams.sunglareParameters.signalizedIntersectionCodes.values.push(value);
                queryParams.sunglareParameters.signalizedIntersectionCodes.labels.push(label);
            }
            
        }
        else {
            if (variableList === "travelDirectionCodes") {
                for (var i = reportParams.sunglareParameters.travelDirectionCodes.values.length - 1; i >= 0; i--) {
                    if (reportParams.sunglareParameters.travelDirectionCodes.values[i] === value) {
                        reportParams.sunglareParameters.travelDirectionCodes.values.splice(i, 1);
                        queryParams.sunglareParameters.travelDirectionCodes.labels.splice(i, 1);
                        break;
                    }
                }
            }
            else if (variableList === "timeOfDayCodes") {
                for (var i = reportParams.sunglareParameters.timeOfDayCodes.values.length - 1; i >= 0; i--) {
                    if (reportParams.sunglareParameters.timeOfDayCodes.values[i] === value) {
                        reportParams.sunglareParameters.timeOfDayCodes.values.splice(i, 1);
                        queryParams.sunglareParameters.timeOfDayCodes.labels.splice(i, 1);
                        break;
                    }
                }
            }
            else if (variableList === "signalizedIntersectionCodes") {
                for (var i = reportParams.sunglareParameters.signalizedIntersectionCodes.values.length - 1; i >= 0; i--) {
                    if (reportParams.sunglareParameters.signalizedIntersectionCodes.values[i] === value) {
                        reportParams.sunglareParameters.signalizedIntersectionCodes.values.splice(i, 1);
                        queryParams.sunglareParameters.signalizedIntersectionCodes.labels.splice(i, 1);
                        break;
                    }
                }
            }
        }
        queryString.updateStringQuery(reportParams, queryParams);

        console.log(filterp);
        console.log(queryParams);

    }

    return {
        addCheckbox: addCheckbox,
        handleCondition: handleCondition
    }
})