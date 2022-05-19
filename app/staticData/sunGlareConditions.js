define(function () {
    var vehicleDirections = [
        { label: 'North', value: '01', },
        { label: 'East', value: '02' },
        { label: 'South', value: '03' },
        { label: 'West', value: '04' }
    ];

    var hoursOfDay = [
        // { label: '00:00', value: '00' },
        // { label: '01:00', value: '01' },
        // { label: '02:00', value: '02' },
        // { label: '03:00', value: '03' },
        // { label: '04:00', value: '04' },
        { label: '5 AM', value: '05' },
        { label: '6 AM', value: '06' },
        { label: '7 AM', value: '07' },
        { label: '8 AM', value: '08' },
        { label: '9 AM', value: '09' },
        { label: '10 AM', value: '10' },
        { label: '11 AM', value: '11' },
        { label: '12 PM', value: '12' },
        { label: '1 PM', value: '13' },
        { label: '2 PM', value: '14' },
        { label: '3 PM', value: '15' },
        { label: '4 PM', value: '16' },
        { label: '5 PM', value: '17' },
        { label: '6 PM', value: '18' },
        { label: '7 PM', value: '19' },
        { label: '8 PM', value: '20' },
        // { label: '21:00', value: '21' },
        // { label: '22:00', value: '22' },
        // { label: '23:00', value: '23' }
    ];

    var signzalizedIntersectionAttributes = [
        { label: 'Adult Crossing Guard', attribute: 'trf_ctrl_adult_crossing_guard' },
        { label: 'Channelization (Painted)', attribute: 'trf_ctrl_channelization_painted' },
        { label: 'Channelization (Physical)', attribute: 'trf_ctrl_channelization_physical' },
        { label: 'Flagman', attribute: 'trf_ctrl_flagman' },
        { label: 'Flashing Traffic Control', attribute: 'trf_ctrl_flashing_traffic_control' },
        { label: 'Lane Markings', attribute: 'trf_ctrl_lane_markings' },
        { label: 'None', attribute: 'trf_ctrl_no_control_present' },
        { label: 'Other', attribute: 'trf_ctrl_other' },
        { label: 'Police Officer', attribute: 'trf_ctrl_police_officer' },
        { label: 'School Zone Signs', attribute: 'trf_ctrl_school_zone_signs_controls' },
        { label: 'Stop Sign', attribute: 'trf_ctrl_stop_sign' },
        { label: 'Traffic Signal', attribute: 'trf_ctrl_traffic_signal' },
        { label: 'Warning Signal', attribute: 'trf_ctrl_warning_signal' },
        { label: 'Watchman', attribute: 'trf_ctrl_rr_watchman' },
        { label: 'Yield Sign', attribute: 'trf_ctrl_yield_sign' },
    ];

    function getVehicleDirections() {
        return vehicleDirections;
    }

    function getHoursOfDay() {
        return hoursOfDay;
    }

    function getSignzalizedIntersectionAttributes() {
        return signzalizedIntersectionAttributes;
    }

    return {
        getVehicleDirections: getVehicleDirections,
        getHoursOfDay: getHoursOfDay,
        getSignzalizedIntersectionAttributes: getSignzalizedIntersectionAttributes
    };
});