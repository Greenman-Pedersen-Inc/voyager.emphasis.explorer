define([
    "./js/lib/gridjs.production.min.js",
    "./app/CodeTranslator.js"
], function(
    gridjs, CodeTranslator
) {
    return function PopupGrid(columnArray, featureData, classNames) {
        let excludedFields = ['Shape_Area', 'Shape_Leng'];
        let translatedAttributes = CodeTranslator.convertFeature(featureData);
        let filteredFeatures = translatedAttributes.filter(element => !excludedFields.includes(element[0]));

        this.domNode = document.createDocumentFragment();
        this.grid = new gridjs.Grid({
            columns: columnArray,
            data: filteredFeatures,
        });

        if (classNames) {
            this.grid.updateConfig({
                className: classNames
            });
        }

        this.grid.render(this.domNode);
    }
});