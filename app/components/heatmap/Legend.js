define([
    "./app/staticData/mapLayers.js",
    "./app/components/popup/PopupGrid.js",
    // "./app/ui/map/ToggleVisualizationButton.js",
], function(
    mapLayersHelper,
    PopupGrid,
    // toggleVisualizationButtonHelper
) {
    return function Legend(map) {
        var self = this;
        var contentHolder = document.getElementById('other-legend');

        this.clear = function() {
            while (contentHolder.lastChild) {
                parent.removeChild(contentHolder.lastChild);
            }
        }

        this.update = function(legendScheme, legendAttributes) {
            var legendHolder = document.getElementById(legendAttributes.holder);
            var legendLoading = document.getElementById(legendAttributes.loading);

            const removeChilds = (parent) => {
                while (parent.lastChild) {
                    parent.removeChild(parent.lastChild);
                }
            };

            legendLoading.classList.remove('hidden');
            // toggleVisualizationButtonHelper.ToggleButtonWorking();

            // remove current legend items
            removeChilds(legendHolder);

            if (legendScheme.length == 0) {
                legendLoading.classList.remove('hidden');
                // toggleVisualizationButtonHelper.ToggleButtonWorking();
            } else {
                var legendSchemeReverse = legendScheme.reverse();
                legendSchemeReverse.forEach(item => {
                    var itemDiv = document.createElement("div");
                    var itemSpan = document.createElement("span");
                    itemSpan.style.backgroundColor = item.color;
                    // var floor = Math.floor(item.from/100)*100;
                    // var ceiling = Math.ceil(item.to/100)*100;
                    var itemLabel = document.createTextNode(item.from.toLocaleString("en-US") + " - " + item.to.toLocaleString("en-US"));
                    itemDiv.appendChild(itemSpan);
                    itemDiv.appendChild(itemLabel);
                    legendHolder.appendChild(itemDiv);
                });
                legendLoading.classList.add('hidden');
            }
            // toggleVisualizationButtonHelper.ToggleButtonWorking(false);
        }

        this.createLegendScheme = function(features) {
            var colorRange = [];

            function minMax(someArrayOfObjects) {
                if (someArrayOfObjects.length == 0) {
                    return {
                        max: 0,
                        min: 0
                    };
                }
                const values = someArrayOfObjects.map(item => item['properties']['crashes']);
                return {
                    max: Math.max.apply(null, values),
                    min: Math.min.apply(null, values)
                };
            }

            // var features = map.queryRenderedFeatures({ layers: [heatmapLayer] });

            if (features.length > 0) {
                var colorArray = ['#a1dbb2', '#fee5ad', '#faca66', '#f7a541', '#f45d4c'];
                var minMaxCrashes = minMax(features);
                var min = minMaxCrashes.min;
                var max = minMaxCrashes.max;
                var difference = max - min;

                var lowerBound = 0;
                if (difference > colorArray.length) {
                    var bucketSize = Math.floor(difference / colorArray.length);
                    for (var i = 0; i < colorArray.length; i++) {
                        if (i == colorArray.length - 1) {
                            colorRange.push({
                                from: lowerBound,
                                to: max,
                                color: colorArray[i],
                            });
                        } else {
                            colorRange.push({
                                from: lowerBound,
                                to: lowerBound + bucketSize - 1,
                                color: colorArray[i],
                            });
                            lowerBound = lowerBound + bucketSize;
                        }
                    }
                } else if (difference <= 1) {
                    colorRange.push({
                        from: 0,
                        to: max,
                        color: '#f45d4c',
                    });
                } else {
                    for (var i = 0; i < max - 1; i++) {
                        colorRange.push({
                            from: i + 1,
                            to: i + 2,
                            color: colorArray[i],
                        });
                    }
                }
            }

            return colorRange;
        }

        this.createLegendScheme = function(layerString, countAttribute, colorArray) {
            var colorRange = [];

            function minMax(someArrayOfObjects) {
                if (someArrayOfObjects.length == 0) {
                    return {
                        max: 0,
                        min: 0
                    };
                }
                const values = someArrayOfObjects.map(item => item['properties'][countAttribute]);
                return {
                    max: Math.max.apply(null, values),
                    min: Math.min.apply(null, values)
                };
            }

            var features = map.queryRenderedFeatures({ layers: [layerString] });

            if (features.length > 0) {
                var minMaxCrashes = minMax(features);
                var min = minMaxCrashes.min;
                var max = minMaxCrashes.max;
                var difference = max - min;

                var lowerBound = 0;
                if (difference > colorArray.length) {
                    var bucketSize = Math.floor(difference / colorArray.length);
                    for (var i = 0; i < colorArray.length; i++) {
                        if (i == colorArray.length - 1) {
                            colorRange.push({
                                from: lowerBound,
                                to: max,
                                color: colorArray[i],
                            });
                        } else {
                            colorRange.push({
                                from: lowerBound,
                                to: lowerBound + bucketSize - 1,
                                color: colorArray[i],
                            });
                            lowerBound = lowerBound + bucketSize;
                        }
                    }
                } else if (difference <= 1) {
                    colorRange.push({
                        from: 0,
                        to: max,
                        color: '#f45d4c',
                    });
                } else {
                    for (var i = 0; i < max - 1; i++) {
                        colorRange.push({
                            from: i + 1,
                            to: i + 2,
                            color: colorArray[i],
                        });
                    }
                }
            }

            return colorRange;
        }

        this.addCrashLegendEntry = function(legendScheme, layer, title, visible = 'visible') {
            let subLegendCardCount = contentHolder.querySelectorAll('card').length;
            loadingIndicator.classList.remove('hidden');

            if (legendScheme.length == 0) {
                let subLegendCard = document.createElement('div');
                subLegendCard.className = 'card';

                let subLegendCardHeader = document.createElement('div');
                subLegendCardHeader.id = `card-header-${subLegendCardCount}`;
                subLegendCardHeader.className = 'card-header border-bot-0';

                let subLegendCardHeaderCheckbox = document.createElement('input');
                subLegendCardHeaderCheckbox.className = 'form-check-input my-2';
                subLegendCardHeaderCheckbox.type = 'checkbox';
                subLegendCardHeaderCheckbox.checked = (visible === 'visible' ? true : false);
                map.setLayoutProperty(layer, 'visibility', visible);
                subLegendCardHeaderCheckbox.addEventListener('change', function(event) {
                    if (this.checked) {
                        map.setLayoutProperty(layer, 'visibility', 'visible');
                    } else {
                        map.setLayoutProperty(layer, 'visibility', 'none');
                    }
                })

                let subLegendCardHeaderCheckboxLabel = document.createElement('label');
                subLegendCardHeaderCheckboxLabel.className = 'form-check-label';
                subLegendCardHeaderCheckboxLabel.append(subLegendCardHeaderCheckbox);

                let subLegendCardHeaderToggle = document.createElement('button');
                subLegendCardHeaderToggle.className = 'btn btn-sm';
                subLegendCardHeaderToggle.type = 'button';
                subLegendCardHeaderToggle.innerHTML = title;

                subLegendCardHeader.append(subLegendCardHeaderCheckboxLabel, subLegendCardHeaderToggle);
                subLegendCard.append(subLegendCardHeader);
                contentHolder.append(subLegendCard);

                loadingIndicator.classList.add('hidden');
            } else {
                let subLegendCard = document.createElement('div');
                subLegendCard.className = 'card';

                let subLegendCardHeader = document.createElement('div');
                subLegendCardHeader.id = `card-header-${subLegendCardCount}`;
                subLegendCardHeader.className = 'card-header';

                let subLegendCardHeaderCheckbox = document.createElement('input');
                subLegendCardHeaderCheckbox.className = 'form-check-input my-2';
                subLegendCardHeaderCheckbox.type = 'checkbox';
                subLegendCardHeaderCheckbox.checked = (visible === 'visible' ? true : false);
                map.setLayoutProperty(layer, 'visibility', visible);
                subLegendCardHeaderCheckbox.addEventListener('change', function(event) {
                    if (this.checked) {
                        map.setLayoutProperty(layer, 'visibility', 'visible');
                        console.log(layer);
                    } else {
                        map.setLayoutProperty(layer, 'visibility', 'none');
                    }
                })

                let subLegendCardHeaderCheckboxLabel = document.createElement('label');
                subLegendCardHeaderCheckboxLabel.className = 'form-check-label';
                subLegendCardHeaderCheckboxLabel.append(subLegendCardHeaderCheckbox);

                let subLegendCardHeaderToggle = document.createElement('button');
                subLegendCardHeaderToggle.className = 'btn btn-sm';
                subLegendCardHeaderToggle.type = 'button';
                subLegendCardHeaderToggle.innerHTML = title;
                subLegendCardHeaderToggle.setAttribute('aria-expanded', 'true');
                subLegendCardHeaderToggle.setAttribute('aria-controls', `collapse-pane-${subLegendCardCount}`);
                subLegendCardHeaderToggle.setAttribute('data-target', `#collapse-pane-${subLegendCardCount}`);
                subLegendCardHeaderToggle.setAttribute('data-toggle', 'collapse');

                subLegendCardHeader.append(subLegendCardHeaderCheckboxLabel, subLegendCardHeaderToggle);

                let legendCollapse = document.createElement('div');
                legendCollapse.id = `collapse-pane-${subLegendCardCount}`;
                legendCollapse.className = 'collapse show';
                legendCollapse.setAttribute('data-parent', `#${contentHolder.id}`);

                let legendCollapseContent = document.createElement('div');
                legendCollapseContent.className = 'card-body';
                legendCollapse.append(legendCollapseContent);

                subLegendCard.append(subLegendCardHeader, legendCollapse);

                let legendSchemeReverse = legendScheme.reverse();

                legendSchemeReverse.forEach(item => {
                    let itemDiv = document.createElement("div");
                    let itemSpan = document.createElement("span");
                    itemSpan.style.backgroundColor = item.color;
                    // var floor = Math.floor(item.from/100)*100;
                    // var ceiling = Math.ceil(item.to/100)*100;
                    let itemLabel = document.createTextNode(item.from.toLocaleString("en-US") + " - " + item.to.toLocaleString("en-US"));
                    itemDiv.appendChild(itemSpan);
                    itemDiv.appendChild(itemLabel);
                    legendCollapseContent.appendChild(itemDiv);
                });

                loadingIndicator.classList.add('hidden');
                contentHolder.append(subLegendCard);
            }
        }

        this.createHeatmapLegend = function() {
            // create a category card for this group
            var groupCard = document.createElement('div');
            groupCard.className = 'card border-radius-0 border-0';
            let groupCardHeader = document.createElement('div');
            groupCardHeader.id = `card-header-${legendGroup.label}`;
            groupCardHeader.className = 'card-header';

            let groupCardHeaderToggle = document.createElement('button');
            groupCardHeaderToggle.className = 'btn btn-sm legend-group-label';
            groupCardHeaderToggle.type = 'button';
            groupCardHeaderToggle.innerHTML = '&#x25E2 ' + legendGroup.label + " Layers";
            groupCardHeaderToggle.setAttribute('aria-expanded', 'false');
            groupCardHeaderToggle.setAttribute('aria-controls', `collapse-pane-${legendGroup.label}`);
            groupCardHeaderToggle.setAttribute('data-target', `#collapse-pane-${legendGroup.label}`);
            groupCardHeaderToggle.setAttribute('data-toggle', 'collapse');
            groupCardHeader.append(groupCardHeaderToggle);

            let legendCollapse = document.createElement('div');
            legendCollapse.id = `collapse-pane-${legendGroup.label}`;
            legendCollapse.className = 'collapse';
            legendCollapse.setAttribute('data-parent', `#${contentHolder.id}`);

            let legendCollapseContent = document.createElement('div');
            legendCollapseContent.className = 'card-body legend-subitem-div';
        }

        this.createLegendEntries = function(legendGroup, visible = 'none') {
            // create a category card for this group
            var groupCard = document.createElement('div');
            groupCard.className = 'card border-radius-0';
            let groupCardHeader = document.createElement('div');
            groupCardHeader.id = `card-header-${legendGroup.label}`;
            groupCardHeader.className = 'card-header';

            let groupCardHeaderToggle = document.createElement('button');
            groupCardHeaderToggle.className = 'btn btn-sm legend-group-label';
            groupCardHeaderToggle.type = 'button';
            groupCardHeaderToggle.innerHTML = '&#x25E2 ' + legendGroup.label + " Layers";
            groupCardHeaderToggle.setAttribute('aria-expanded', 'false');
            groupCardHeaderToggle.setAttribute('aria-controls', `collapse-pane-${legendGroup.label}`);
            groupCardHeaderToggle.setAttribute('data-target', `#collapse-pane-${legendGroup.label}`);
            groupCardHeaderToggle.setAttribute('data-toggle', 'collapse');
            groupCardHeader.append(groupCardHeaderToggle);

            let legendCollapse = document.createElement('div');
            legendCollapse.id = `collapse-pane-${legendGroup.label}`;
            legendCollapse.className = 'collapse';
            legendCollapse.setAttribute('data-parent', `#${contentHolder.id}`);

            let legendCollapseContent = document.createElement('div');
            legendCollapseContent.className = 'card-body legend-subitem-div';

            if (legendGroup.layers) {
                legendGroup.layers.forEach(layerGroup => {
                    if (layerGroup.layers) {
                        // group item for sub layers
                        var layerGroupDiv = document.createElement('details');
                        layerGroupDiv.className = 'font-size-legend margin-bot-5';
                        var layerGroupHeader = document.createElement('summary');
                        layerGroupHeader.innerHTML = layerGroup.label;
                        layerGroupDiv.append(layerGroupHeader);

                        layerGroup.layers.forEach(subgroup => {
                            // add the layer and source if they arent on the map already
                            var idName = legendGroup.label + "_" + layerGroup.label + "_" + subgroup.label;
                            var mapSourceName = legendGroup.label + "_" + layerGroup.label + "_" + subgroup.label + "_src";
                            var mapLayerName = legendGroup.label + "_" + layerGroup.label + "_" + subgroup.label + "_data";
                            idName = idName.replace(/ /g, "_").replace("/", "_").toLowerCase();
                            mapSourceName = mapSourceName.replace(/ /g, "_").replace("/", "_").toLowerCase();
                            mapLayerName = mapLayerName.replace(/ /g, "_").replace("/", "_").toLowerCase();
                            if (!map.getSource(mapSourceName)) {
                                map.addSource(mapSourceName, {
                                    "url": "mapbox://" + subgroup.url,
                                    "type": subgroup.sourceType
                                });
                                map.addLayer({
                                    'id': mapLayerName,
                                    'type': subgroup.layerType,
                                    'source': mapSourceName,
                                    'source-layer': subgroup.source,
                                    paint: subgroup.paint
                                });
                                map.on('click', mapLayerName, function(e) {
                                    if (e.originalEvent.cancelBubble) {
                                        return;
                                    }
                                    e.originalEvent.cancelBubble = true; // prevent the map.onclick handler

                                    console.log(e.features);
                                    var feature = e.features[0];
                                    var tableData = [];
                                    subgroup.dataAttributes.forEach(attr => {
                                        if (feature.properties.hasOwnProperty(attr)) {
                                            var data = [attr, feature.properties[attr]];
                                            tableData.push(data);
                                        }
                                    });

                                    var popupDiv = document.createElement('div');
                                    popupDiv.style = 'width: calc(20vw); height: calc(20vh); overflow-y: scroll; overflow-x: auto; border-left: 1px solid lightgrey; border-top: 1px solid lightgrey;border-bottom: 1px solid lightgrey;margin-left: .8rem; margin-right: 0.75em;';
                                    var headerDiv = document.createElement('div');
                                    var htmlString = "<h6>" + legendGroup.label + " - " + layerGroup.label + " (" + subgroup.label + ")</h6>";
                                    headerDiv.innerHTML = htmlString;

                                    var tableDiv = document.createElement('div');
                                    var cols = ['Field', 'Value'];
                                    var classNames = {
                                        td: 'layer-popup-td',
                                        th: 'layer-popup-th',
                                        table: 'layer-popup-font layer-popup-table'
                                    };
                                    var popupTable = new PopupGrid(tableDiv, cols, tableData, classNames);
                                    popupDiv.append(headerDiv, tableDiv);

                                    new mapboxgl.Popup()
                                        .setLngLat(e.lngLat)
                                        .setDOMContent(popupDiv)
                                        .addTo(map);
                                });
                                map.on('mouseenter', mapLayerName, function() {
                                    map.getCanvas().style.cursor = 'pointer';
                                });
                                map.on('mouseleave', mapLayerName, function() {
                                    map.getCanvas().style.cursor = '';
                                });
                            }

                            let subLegendCard = document.createElement('div');
                            let subLegendCardHeader = document.createElement('div');
                            subLegendCardHeader.className = 'form-check font-size-legend margin-left-1rem';
                            subLegendCardHeader.id = idName;
                            let subLegendCardHeaderCheckbox = document.createElement('input');
                            subLegendCardHeaderCheckbox.className = 'form-check-input';
                            subLegendCardHeaderCheckbox.type = 'checkbox';
                            subLegendCardHeaderCheckbox.id = idName + '_checkbox';
                            subLegendCardHeaderCheckbox.checked = (visible === 'visible' ? true : false);
                            map.setLayoutProperty(mapLayerName, 'visibility', visible);
                            subLegendCardHeaderCheckbox.addEventListener('change', function(event) {
                                if (this.checked) {
                                    map.setLayoutProperty(mapLayerName, 'visibility', 'visible');
                                } else {
                                    map.setLayoutProperty(mapLayerName, 'visibility', 'none');
                                }
                            })

                            let subLegendCardHeaderCheckboxLabel = document.createElement('label');
                            subLegendCardHeaderCheckboxLabel.className = 'form-check-label';
                            subLegendCardHeaderCheckboxLabel.setAttribute("for", idName + '_checkbox');
                            subLegendCardHeaderCheckboxLabel.append(subLegendCardHeaderCheckbox);
                            subLegendCardHeaderCheckboxLabel.innerHTML = subgroup.label;

                            subLegendCardHeader.append(subLegendCardHeaderCheckbox, subLegendCardHeaderCheckboxLabel);
                            subLegendCard.append(subLegendCardHeader);
                            layerGroupDiv.append(subLegendCard);
                        });

                        legendCollapseContent.append(layerGroupDiv);
                    } else {
                        // add the layer and source if they arent on the map already
                        var idName = legendGroup.label + "_" + layerGroup.label;
                        var mapSourceName = legendGroup.label + "_" + layerGroup.label + "_src";
                        var mapLayerName = legendGroup.label + "_" + layerGroup.label + "_data";
                        idName = idName.replace(/ /g, "_").toLowerCase();
                        mapSourceName = mapSourceName.replace(/ /g, "_").toLowerCase();
                        mapLayerName = mapLayerName.replace(/ /g, "_").toLowerCase();
                        if (!map.getSource(mapSourceName)) {
                            map.addSource(mapSourceName, {
                                "url": "mapbox://" + layerGroup.url,
                                "type": layerGroup.sourceType
                            });
                            map.addLayer({
                                'id': mapLayerName,
                                'type': layerGroup.layerType,
                                'source': mapSourceName,
                                'source-layer': layerGroup.source,
                                paint: layerGroup.paint
                            });
                            map.on('click', mapLayerName, function(e) {
                                if (e.originalEvent.cancelBubble) {
                                    return;
                                }
                                e.originalEvent.cancelBubble = true; // prevent the map.onclick handler

                                console.log(e.features);
                                var feature = e.features[0];
                                var tableData = [];
                                layerGroup.dataAttributes.forEach(attr => {
                                    if (feature.properties.hasOwnProperty(attr)) {
                                        var data = [attr, feature.properties[attr]];
                                        tableData.push(data);
                                    }
                                });
                                var popupDiv = document.createElement('div');
                                popupDiv.style = 'width: calc(20vw); height: calc(20vh); overflow-y: scroll; overflow-x: auto; border-left: 1px solid lightgrey; border-top: 1px solid lightgrey;border-bottom: 1px solid lightgrey;margin-left: .8rem; margin-right: 0.75em;';
                                var headerDiv = document.createElement('div');
                                var htmlString = "<h6>" + legendGroup.label + " - " + layerGroup.label + "</h6>";
                                headerDiv.innerHTML = htmlString;
                                var tableDiv = document.createElement('div');
                                var cols = ['Field', 'Value'];
                                var classNames = {
                                    td: 'layer-popup-td',
                                    th: 'layer-popup-th',
                                    table: 'layer-popup-font layer-popup-table'
                                };
                                var popupTable = new PopupGrid(tableDiv, cols, tableData, classNames);
                                popupDiv.append(headerDiv, tableDiv);
                                new mapboxgl.Popup()
                                    .setLngLat(e.lngLat)
                                    .setDOMContent(popupDiv)
                                    .addTo(map);
                            });
                            map.on('mouseenter', mapLayerName, function() {
                                map.getCanvas().style.cursor = 'pointer';
                            });
                            map.on('mouseleave', mapLayerName, function() {
                                map.getCanvas().style.cursor = '';
                            });
                        }
                        // there are no sub layers to this group. display as an individual card
                        let subLegendCard = document.createElement('div');
                        let subLegendCardHeader = document.createElement('div');
                        subLegendCardHeader.className = 'form-check font-size-legend';
                        subLegendCardHeader.id = idName;
                        let subLegendCardHeaderCheckbox = document.createElement('input');
                        subLegendCardHeaderCheckbox.className = 'form-check-input';
                        subLegendCardHeaderCheckbox.type = 'checkbox';
                        subLegendCardHeaderCheckbox.id = idName + '_checkbox';
                        subLegendCardHeaderCheckbox.checked = (visible === 'visible' ? true : false);
                        map.setLayoutProperty(mapLayerName, 'visibility', visible);
                        subLegendCardHeaderCheckbox.addEventListener('change', function(event) {
                            if (this.checked) {
                                map.setLayoutProperty(mapLayerName, 'visibility', 'visible');
                            } else {
                                map.setLayoutProperty(mapLayerName, 'visibility', 'none');
                            }
                        })

                        let subLegendCardHeaderCheckboxLabel = document.createElement('label');
                        subLegendCardHeaderCheckboxLabel.className = 'form-check-label';
                        subLegendCardHeaderCheckboxLabel.setAttribute("for", idName + '_checkbox');
                        subLegendCardHeaderCheckboxLabel.innerHTML = layerGroup.label;

                        subLegendCardHeader.append(subLegendCardHeaderCheckbox, subLegendCardHeaderCheckboxLabel);
                        subLegendCard.append(subLegendCardHeader);
                        legendCollapseContent.append(subLegendCard);
                    }
                });
            }

            legendCollapse.append(legendCollapseContent);
            groupCard.append(groupCardHeader, legendCollapse);
            contentHolder.append(groupCard);

        }

        this.addStaticLayers = function() {
            var staticMapLayers = mapLayersHelper.getStaticMapLayers();
            Object.keys(staticMapLayers).forEach(function(key) {
                console.log(staticMapLayers[key]);
                var legendGroup = staticMapLayers[key];
                self.createLegendEntries(legendGroup);
            });
        }




        // this.update = function(layerType, legendScheme) {
        //     var idString = "county-legend";

        //     if (layerType == "muni") {
        //         idString = "muni-legend";
        //     }

        //     var legendHolder = document.getElementById(idString + '-holder');
        //     var legendLoading = document.getElementById(idString + '-loading');

        //     const removeChildren = (contentHolder) => {
        //         while (contentHolder.lastChild) {
        //             contentHolder.removeChild(contentHolder.lastChild);
        //         }
        //     };
        //     // remove current legend items
        //     removeChildren(contentHolder);

        //     if (legendScheme.length == 0) {
        //         loadingIndicator.classList.remove('hidden');
        //     } else {
        //         var legendSchemeReverse = legendScheme.reverse();
        //         legendSchemeReverse.forEach(item => {
        //             var itemDiv = document.createElement("div");
        //             var itemSpan = document.createElement("span");
        //             itemSpan.style.backgroundColor = item.color;
        //             // var floor = Math.floor(item.from/100)*100;
        //             // var ceiling = Math.ceil(item.to/100)*100;
        //             var itemLabel = document.createTextNode(item.from.toLocaleString("en-US") + " - " + item.to.toLocaleString("en-US"));
        //             itemDiv.appendChild(itemSpan);
        //             itemDiv.appendChild(itemLabel);
        //             contentHolder.appendChild(itemDiv);
        //         });
        //         loadingIndicator.classList.add('hidden');
        //     }
        // };
        // var titleBlock = document.createElement('div');
        // titleBlock.className = 'legendTitle';
        // titleBlock.title = 'Legend';
        // titleBlock.innerHTML = 'Legend';

        // var loadingIndicator = document.createElement('span');
        // loadingIndicator.className = 'loading hidden';

        // var contentHolder = document.createElement('div');
        // contentHolder.id = 'legendAccordion';
        // contentHolder.className = 'accordion';


        // //         contentHolder.innerHTML = `

        // //       <div class="accordion" id="accordionExample">
        // // <div class="card">
        // //     <div class="card-header" id="headingOne">
        // //         <label class="form-check-label">
        // //             <input class="form-check-input my-2" type="checkbox" value="" id="defaultCheck1">
        // //         </label>
        // //         <button class="btn btn-sm" type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
        // //             Crashes (County)
        // //         </button>
        // //     </div>
        // //     <div id="collapseOne" class="collapse show" aria-labelledby="headingOne" data-parent="#accordionExample">
        // //         <div class="card-body">
        // //             Some placeholder content for the first accordion panel. This panel is shown by default, thanks to the <code>.show</code> class.
        // //         </div>
        // //     </div>
        // // </div>




        // //   <div class="card">
        // //     <div class="card-header" id="headingTwo">
        // //       <h2 class="mb-0">
        // //         <button class="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
        // //           Collapsible Group Item #2
        // //         </button>
        // //       </h2>
        // //     </div>
        // //     <div id="collapseTwo" class="collapse" aria-labelledby="headingTwo" data-parent="#accordionExample">
        // //       <div class="card-body">
        // //         Some placeholder content for the second accordion panel. This panel is hidden by default.
        // //       </div>
        // //     </div>
        // //   </div>
        // //   <div class="card">
        // //     <div class="card-header" id="headingThree">
        // //       <h2 class="mb-0">
        // //         <button class="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse" data-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
        // //           Collapsible Group Item #3
        // //         </button>
        // //       </h2>
        // //     </div>
        // //     <div id="collapseThree" class="collapse" aria-labelledby="headingThree" data-parent="#accordionExample">
        // //       <div class="card-body">
        // //         And lastly, the placeholder content for the third and final accordion panel. This panel is hidden by default.
        // //       </div>
        // //     </div>
        // //   </div>
        // // </div>

        // //         `

        // this.domNode.append(titleBlock, loadingIndicator, contentHolder)
    }
})