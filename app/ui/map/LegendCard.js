define(['./app/Utilities.js'], function(Utilities) {
    function createLegendScheme(features, layerDefinition) {
        var colorRange = [];

        function minMax(someArrayOfObjects) {
            if (someArrayOfObjects) {
                if (someArrayOfObjects.length == 0) {
                    return {
                        max: 0,
                        min: 0
                    };
                }
                const values = someArrayOfObjects.map(item => item['properties']['crashes'] || item['properties']['point_count'] || 1);

                return {
                    max: Math.max.apply(null, values),
                    min: Math.min.apply(null, values)
                };
            } else {
                return {
                    max: 0,
                    min: 0
                };
            }
        }

        function assignColorRamp(minMaxCrashes, unclusteredCrashes = false) {
            let colorArray = ['#a1dbb2', '#fee5ad', '#faca66', '#f7a541', '#f45d4c'];
            let generatedRange = [];
            let min = minMaxCrashes.min;
            let max = minMaxCrashes.max;
            let difference = max - min;
            let bucketSize = Math.floor(difference / colorArray.length);

            if (unclusteredCrashes) {
                generatedRange.push({
                    from: 1,
                    to: 1,
                    color: colorArray.shift(),
                    clustered: false,
                    label: '1 (Unclustered Point)'
                });
                min += 1;
            }

            if (difference > colorArray.length) {
                for (var i = 0; i < colorArray.length; i++) {
                    if (i == colorArray.length - 1) {
                        generatedRange.push({
                            from: min,
                            to: max,
                            color: colorArray[i],
                            clustered: true
                        });
                    } else {
                        generatedRange.push({
                            from: min,
                            to: min + bucketSize - 1,
                            color: colorArray[i],
                            clustered: true
                        });
                        min = min + bucketSize;
                    }
                }
            } else if (min === 1 && max === 1) {
                generatedRange.push({
                    from: 1,
                    to: 1,
                    color: colorArray.shift(),
                    clustered: false,
                    label: '1 (Unclustered Point)'
                });
            } else if (min === max) {
                generatedRange.push({
                    from: min,
                    to: max,
                    color: colorArray[colorArray.length - 1],
                    clustered: false,
                    label: min.toString()
                });
            } else {
                for (var i = 0; i < difference; i++) {
                    generatedRange.push({
                        from: i + min,
                        to: i + min,
                        color: colorArray[i],
                        clustered: true
                    });
                }
            }

            return generatedRange;
        }

        if (features.length > 0) {
            let minMaxCrashes = minMax(features);

            if (minMaxCrashes.min && minMaxCrashes.max) {
                if (minMaxCrashes.min === 0) {
                    console.error('cluster with no crashes returned!', features)
                } else if (minMaxCrashes.min === 1) { // there are unclustered points on the map
                    if (minMaxCrashes.max === 1) { // only unclusterd points returned
                        // console.log('only unclusterd points returned')
                        colorRange = assignColorRamp(minMaxCrashes, layerDefinition.id === 'clusters' ? true : false);
                    } else {
                        // console.log('there is a mix of points clustered and unclustered')
                        colorRange = assignColorRamp(minMaxCrashes, layerDefinition.id === 'clusters' ? true : false);
                    }
                } else { // all points returned are clustered
                    // console.log('all points returned are clustered')
                    colorRange = assignColorRamp(minMaxCrashes);
                }
            } else {
                console.error('the bounds are not returning correctly', minMaxCrashes)
            }
        }

        return colorRange;
    }

    return function LegendCard(parentID, map, layerDefinition, features = [], visible = true) {
        const self = this;

        let legendScheme = createLegendScheme(features, layerDefinition);

        function populateCardEntries(legendSchemeToApply) {
            let legendEntries = document.createDocumentFragment();

            legendSchemeToApply.sort(function(a, b) { return b.from - a.from }).forEach(item => {
                let symbol;
                let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                let itemDiv = document.createElement("div");
                let descriptionSpan = document.createElement("span");

                itemDiv.style = "display: flex; align-items: center";

                svg.setAttribute('height', '20');
                svg.setAttribute('width', '20');
                svg.style = 'margin-right: 0.75em;'

                descriptionSpan.classList.add('descriptionSpan');

                if (layerDefinition.type === 'fill') {
                    symbol = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    symbol.setAttribute('height', '20');
                    symbol.setAttribute('width', '20');
                    symbol.setAttribute('fill', item.color);
                    symbol.setAttribute('stroke', 'black');
                    symbol.setAttribute('stroke-width', '1');
                } else {
                    symbol = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    symbol.setAttribute('cx', 10);
                    symbol.setAttribute('cy', 10);
                    symbol.setAttribute('r', 9);
                    symbol.setAttribute('fill', item.color);
                    symbol.setAttribute('stroke', 'black');
                    symbol.setAttribute('stroke-width', '1');
                }

                svg.appendChild(symbol);

                if (item.label && layerDefinition.id === 'clusters') {
                    descriptionSpan.innerHTML = item.label;
                } else if (item.from === item.to) {
                    descriptionSpan.innerHTML = item.from.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                } else {
                    descriptionSpan.innerHTML = `${item.from.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} - ${item.to.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
                }

                itemDiv.append(svg, descriptionSpan);
                legendEntries.appendChild(itemDiv);
            });

            legendSchemeToApply.sort(function(a, b) { return a.from - b.from });

            return legendEntries;
        }

        this.id = layerDefinition.id;
        this.minzoom = layerDefinition.minzoom ? layerDefinition.minzoom : null;
        this.maxzoom = layerDefinition.maxzoom ? layerDefinition.maxzoom : null;
        this.domNode = document.createElement('div');
        this.loadingIndicator = document.createElement('span');
        this.loadingIndicator.className = 'loading';
        this.update = function(filterParameters, features) {
            const legendScheme = createLegendScheme(features, layerDefinition);
            let contentContainer = self.domNode.querySelector('.card-body');

            while (contentContainer.lastChild) {
                contentContainer.removeChild(contentContainer.lastChild);
            }

            if (legendScheme.length > 0) {
                contentContainer.appendChild(populateCardEntries(legendScheme));
            } else {
                let emptyDataSetMessage = document.createElement('div');

                emptyDataSetMessage.innerHTML = 'No data returned';
                contentContainer.appendChild(emptyDataSetMessage);
            }

            if (filterParameters.subCategory) {
                if (filterParameters.subCategory.value !== null) {
                    // htmlStringList.push('<b>' + filterParameters.subCategory.title + '</b>: ' + filterParameters.subCategory.label + '<br>');
                    self.legendCardHeaderToggle.innerHTML = `${filterParameters.subCategory.label} ${layerDefinition.label}`;
                } else {
                    self.legendCardHeaderToggle.innerHTML = `${filterParameters.category.label} ${layerDefinition.label}`;
                }
            } else {
                self.legendCardHeaderToggle.innerHTML = `${filterParameters.category.label} ${layerDefinition.label}`;
            }

            if (layerDefinition.explanation) {
                let explanationBlock = document.createElement('div');
                explanationBlock.id = layerDefinition.explanation.id;
                explanationBlock.className = layerDefinition.explanation.className;
                legendCollapseContent.prepend(explanationBlock);

                tippy(`#${layerDefinition.explanation.id}`, {
                    content: layerDefinition.explanation.text,
                    allowHTML: true,
                    placement: 'bottom',
                    interactive: true,
                });
            }



            return legendScheme;
        }
        this.updateVisibility = function() {
            let layer = map.getLayer(self.id);

            if (layer) {
                if (layer.disabled) {
                    self.domNode.classList.add('hidden');
                    // self.legendCardHeaderCheckbox.checked = false;
                } else {
                    if (Utilities.evaluateZoomVisibility(map.getZoom(), layer.minzoom, layer.maxzoom)) {
                        self.domNode.classList.remove('hidden');

                        if (self.legendCardHeaderCheckbox.checked) {
                            map.setLayoutProperty(layer.id, 'visibility', 'visible');
                        } else {
                            map.setLayoutProperty(layer.id, 'visibility', 'none');
                        }
                    } else {
                        self.domNode.classList.add('hidden');
                    }
                }
            }
        }
        this.domNode.classList.add('card')

        let legendCardHeader = document.createElement('div');
        legendCardHeader.id = `card-header-${layerDefinition.id}`;
        legendCardHeader.className = 'card-header';

        this.legendCardHeaderCheckbox = document.createElement('input');
        this.legendCardHeaderCheckbox.className = 'form-check-input my-2';
        this.legendCardHeaderCheckbox.type = 'checkbox';
        this.legendCardHeaderCheckbox.checked = (visible ? true : false);
        this.legendCardHeaderCheckbox.addEventListener('change', function(event) {
            if (this.checked) {
                // visible attribute used for grouped layers like clusters, uses a setter for the entire layer group.
                if ('visible' in layerDefinition) {
                    layerDefinition.visible = true;
                } else {
                    map.setLayoutProperty(layerDefinition.id, 'visibility', 'visible');
                }
            } else {
                if ('visible' in layerDefinition) {
                    layerDefinition.visible = false;
                } else {
                    map.setLayoutProperty(layerDefinition.id, 'visibility', 'none');
                }
            }
        });

        let legendCardHeaderCheckboxLabel = document.createElement('label');
        legendCardHeaderCheckboxLabel.className = 'form-check-label';
        legendCardHeaderCheckboxLabel.append(this.legendCardHeaderCheckbox);

        this.legendCardHeaderToggle = document.createElement('button');
        this.legendCardHeaderToggle.className = 'btn btn-sm';
        this.legendCardHeaderToggle.type = 'button';
        this.legendCardHeaderToggle.innerHTML = layerDefinition.label;
        this.legendCardHeaderToggle.setAttribute('aria-expanded', 'true');
        this.legendCardHeaderToggle.setAttribute('aria-controls', `collapse-pane-${layerDefinition.id}`);
        this.legendCardHeaderToggle.setAttribute('data-target', `#collapse-pane-${layerDefinition.id}`);
        this.legendCardHeaderToggle.setAttribute('data-toggle', 'collapse');

        legendCardHeader.append(legendCardHeaderCheckboxLabel, this.legendCardHeaderToggle, this.loadingIndicator);

        let legendCollapse = document.createElement('div');
        legendCollapse.id = `collapse-pane-${layerDefinition.id}`;
        legendCollapse.className = 'collapse show';
        legendCollapse.setAttribute('data-parent', `#${parentID}`);

        let legendCollapseContent = document.createElement('div');
        legendCollapseContent.className = 'card-body';
        legendCollapse.append(legendCollapseContent);

        this.domNode.append(legendCardHeader, legendCollapse);

        if (legendScheme.length > 0) {
            legendCollapseContent.appendChild(populateCardEntries(legendScheme));
        }
    }
})