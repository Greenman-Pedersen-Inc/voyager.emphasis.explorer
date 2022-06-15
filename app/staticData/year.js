define(function () {
    const startYear = 2019;
    var d = new Date();
    const endYear = d.getFullYear() - 1;
    const defaultStartYear = endYear - 2; // both the start and end year are inclusive

    function getDefaultStartYear() {
        return defaultStartYear;
    }

    function getDefaultEndYear() {
        return endYear;
    }

    function getAllYears() {
        var list = [];
        for (var i = startYear; i <= endYear; i++) {
            list.push({
                label: i,
                value: i,
            });
        }
        return list;
    }

    function getYearsAfter(startingYear) {
        var list = [];
        for (var i = startingYear; i <= endYear; i++) {
            list.push({
                label: i,
                value: i,
            });
        }
        return list;
    }

    function getYearsBefore(endingYear) {
        var list = [];
        for (var i = startYear; i <= endingYear; i++) {
            list.push({
                label: i,
                value: i,
            });
        }
        return list;
    }

    function getYearsBetween(startingYear, endingYear, returnValuesOnly = false) {
        var list = [];
        if (startYear == null) {
            return [endingYear];
        } else if (endingYear == null) {
            return [startingYear];
        } else {
            if (returnValuesOnly) {
                for (var i = startingYear; i <= endingYear; i++) {
                    list.push(i);
                }
            } else {
                for (var j = startingYear; j <= endingYear; j++) {
                    list.push({
                        label: j,
                        value: j,
                    });
                }
            }
            return list;
        }
    }

    function concatYearRange(yearString, seperator = '-') {
        var yearArray = yearString.split(',');
        if (yearArray.length === 0) {
            return null;
        } else if (yearArray.length === 1) {
            return yearArray[0];
        } else {
            return `${yearArray[0]}${seperator}${yearArray[yearArray.length - 1]}`;
        }
    }

    return {
        getDefaultStartYear: getDefaultStartYear,
        getAllYears: getAllYears,
        getYearsBefore: getYearsBefore,
        getYearsBetween: getYearsBetween,
        concatYearRange: concatYearRange,
        getYearsAfter: getYearsAfter,
        getDefaultEndYear: getDefaultEndYear,
    };
});
