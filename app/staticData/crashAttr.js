define(function () {
    var crashAttributes = [
        // { label: 'Lighting Condition', value: 'light_cond_code', img: "img/light.png" },
        { label: 'Road Surface Condition', value: 'surf_cond_code', img: "img/road.png"},
        { label: 'Road Surface Type', value: 'road_surf_code', img: "img/soil.png"},
        { label: 'Road Horizontal Alignment', value: 'road_horiz_align_code', img: "img/turn.png" },
        { label: 'Road Grade', value: 'road_grade_code', img: "img/grade.png" },
    ];

    function getCrashAttributes() {
        return crashAttributes;
    }

    return {
        getCrashAttributes: getCrashAttributes
    };
});