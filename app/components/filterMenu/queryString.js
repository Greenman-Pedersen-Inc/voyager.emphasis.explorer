define(
    [], function ()    
    {

    function updateQueryString(filterParameters) {
        var htmlStringList = [];
        htmlStringList.push('<b>' + filterParameters.category.title + '</b>: ' + filterParameters.category.label  + '<br>');
        if (filterParameters.subCategory.value !== null) {
            htmlStringList.push('<b>' + filterParameters.subCategory.title + '</b>: ' + filterParameters.subCategory.label  + '<br>');
        }
        htmlStringList.push('<b>' + filterParameters.summary.title + '</b>: ' + filterParameters.summary.label  + '<br>');
        htmlStringList.push('<b>' + filterParameters.temporalFilters.yearFilters.title + '</b>: ' + filterParameters.temporalFilters.yearFilters.label  + '<br>');
        
        if (filterParameters.reportParameters.crashAttributes.values.length > 0) {
            var labels = filterParameters.reportParameters.crashAttributes.labels.join(", ");
            htmlStringList.push('<b>' + filterParameters.reportParameters.crashAttributes.title + '</b>: ' + labels  + '<br>');
        }

        var htmlString = htmlStringList.join("")
        $("#queryString").html(htmlString);
        $("#currentSummary").html(" - " + filterParameters.summary.label);
    }

    return {
        updateQueryString: updateQueryString
    }
})