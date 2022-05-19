define(function(){
    return function Headers () {
        this.initiate = function () {
            changeHeaderColors("EmphasisAreaSelection");
            changeHeaderColors("reportType");
            changeHeaderColors("paramsHeader");
            changeHeaderColors("attributesHeader");
        }
    }

    function changeHeaderColors(headerId) {
        $("#" + headerId + "-button").click(function(e){
            if ($("#" + headerId).hasClass("filter-heading")) {
                // remove all other instances of filter-heading-selected
                $(".filter-heading-selected").each(function() {
                    const id = $(this).attr('id');
                    $("#" + id + "-button").removeClass("filter-heading-button-selected").addClass("filter-heading-button");
                    $("#" + id + "-arrow").removeClass("arrowIconDown").addClass("arrowIconUp");
                    $(this).removeClass("filter-heading-selected").addClass("filter-heading");
                });
                $("#" + headerId + "-button").removeClass("filter-heading-button").addClass("filter-heading-button-selected");
                $("#" + headerId + "-arrow").removeClass("arrowIconUp").addClass("arrowIconDown");
                $("#" + headerId).removeClass("filter-heading").addClass("filter-heading-selected");
            }
            else {
                // remove selected from this header
                $("#" + headerId + "-button").removeClass("filter-heading-button-selected").addClass("filter-heading-button");
                $("#" + headerId + "-arrow").removeClass("arrowIconDown").addClass("arrowIconUp");
                $("#" + headerId).removeClass("filter-heading-selected").addClass("filter-heading");
            }
        });
    }
});