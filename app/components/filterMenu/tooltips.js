define(function() {
    return {
        initalizeTooltips: function() {
            tippy('#njHelp', {
                content: 'Select to generate a State Summary report of the top 25 SRI and mileposts with crashes by category.',
                placement: 'right',
                maxWidth: 375
            });
            tippy('#locHelp', {
                content: 'Select to generate a county or municipal report of the top 25 SRI and mileposts with crashes by category.',
                placement: 'right',
            });
            tippy('#sriHelp', {
                content: 'Select to generate an SRI and milepost report of crashes by category.',
                placement: 'right',
            });
            tippy('#yearHelp', {
                content: 'Select the start and end years to query crashes.',
                placement: 'right',
            });
            tippy('#sortHelp', {
                content: 'Select the SRI and milepost sorting method for the report. <br> <u>Crash Count</u>: Orders by highest crash counts <br> <u>Fatal/Incapacitated</u>: Orders by highest fatal and/or incapacitated counts <br> <u>Milepost</u>: Milepost: Orders by milepost, only available with SRI Summary Location Filter',
                placement: 'right',
                allowHTML: true,
                maxWidth: 550
            });
            tippy('#crashTypeHelp', {
                content: 'There are more than 6 crash types on the NJTR-1 form. Only the top 6 are shown.',
                allowHTML: true,
                placement: 'left'
            });
            tippy('#rollingAverageHelp', {
                content: 'The rolling averages are calculated for a 5 year period ending with the year displayed on the x axis of the chart (inclusive).',
                allowHTML: true,
                placement: 'left'
            });
        }
    }
})