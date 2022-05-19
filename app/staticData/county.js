define(function () {
    var counties = [
        { label: 'Atlantic', value: '01', },
        { label: 'Bergen', value: '02' },
        { label: 'Burlington', value: '03' },
        { label: 'Camden', value: '04' },
        { label: 'Cape May', value: '05' },
        { label: 'Cumberland', value: '06' },
        { label: 'Essex', value: '07' },
        { label: 'Gloucester', value: '08' },
        { label: 'Hudson', value: '09' },
        { label: 'Hunterdon', value: '10' },
        { label: 'Mercer', value: '11' },
        { label: 'Middlesex', value: '12' },
        { label: 'Monmouth', value: '13' },
        { label: 'Morris', value: '14' },
        { label: 'Ocean', value: '15' },
        { label: 'Passaic', value: '16' },
        { label: 'Salem', value: '17' },
        { label: 'Somerset', value: '18' },
        { label: 'Sussex', value: '19' },
        { label: 'Union', value: '20' },
        { label: 'Warren', value: '21' }
    ];

    var mpos = [
        { label: 'DVRPC', value: '03,04,08,11'},
        { label: 'NJTPA', value: '02,07,09,10,12,13,14,15,16,18,19,20,21'},
        { label: 'SJTPO', value: '01,05,06,17'},
    ];

    function getCounties() {
        return counties;
    }

    function getMpos() {
        return mpos;
    }

    function getCountyReadable(countyCode) {
        const target = counties.find(cty => cty.value === countyCode);
        if (target) {
            return target.label;;
        }
        return null;
    }

    return {
        getCounties: getCounties,
        getCountyReadable: getCountyReadable,
        getMpos: getMpos
    };
});