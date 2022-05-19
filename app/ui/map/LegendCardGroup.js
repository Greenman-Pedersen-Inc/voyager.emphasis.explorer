define(['./app/Utilities.js'], function(Utilities) {
    return function LegendCardGroup(parentID, map, legendGroup, visible = false, collapsed = true) {
        const self = this;
        const contentHolder = document.getElementById(parentID);
        const legendCardCount = contentHolder.querySelectorAll('.card').length;

        this.domNode = document.createElement('div');
        this.domNode.className = 'card';
        this.updateVisibility = function() {
            if (legendGroup.layers) {
                legendGroup.layers.forEach(layerGroup => {
                    if (layerGroup.layers) {
                        layerGroup.layers.forEach(subgroup => {
                            map.setLayoutProperty(subgroup.id, 'visibility', legendCardHeaderCheckbox.checked && document.getElementById(subgroup.id + '_checkbox').checked ? 'visible' : 'none');
                        });
                    } else {
                        map.setLayoutProperty(layerGroup.id, 'visibility', legendCardHeaderCheckbox.checked && document.getElementById(layerGroup.id + '_checkbox').checked ? 'visible' : 'none');
                    }
                });
            }
        }

        let legendCardHeader = document.createElement('div');
        legendCardHeader.id = `card-header-${legendCardCount}`;
        legendCardHeader.className = 'card-header';

        let legendCardHeaderCheckbox = document.createElement('input');
        legendCardHeaderCheckbox.className = 'form-check-input my-2';
        legendCardHeaderCheckbox.type = 'checkbox';
        legendCardHeaderCheckbox.checked = (visible ? true : false);

        // map.setLayoutProperty(layer, 'visibility', visible);

        legendCardHeaderCheckbox.addEventListener('change', function(event) {
            if (this.checked) {
                legendCollapseContent.querySelectorAll('.form-check-input').forEach(checkbox => {
                    if (checkbox.checked) {
                        map.setLayoutProperty(checkbox['data-layer'], 'visibility', 'visible');
                    } else {
                        map.setLayoutProperty(checkbox['data-layer'], 'visibility', 'none');
                    }
                })
            } else {
                legendCollapseContent.querySelectorAll('.form-check-input').forEach(checkbox => {
                    map.setLayoutProperty(checkbox['data-layer'], 'visibility', 'none');
                })
            }
        })

        let legendCardHeaderCheckboxLabel = document.createElement('label');
        legendCardHeaderCheckboxLabel.className = 'form-check-label';
        legendCardHeaderCheckboxLabel.append(legendCardHeaderCheckbox);

        let legendCardHeaderToggle = document.createElement('button');
        legendCardHeaderToggle.className = 'btn btn-sm';
        legendCardHeaderToggle.type = 'button';
        legendCardHeaderToggle.innerHTML = legendGroup.label;
        legendCardHeaderToggle.setAttribute('aria-expanded', 'true');
        legendCardHeaderToggle.setAttribute('aria-controls', `collapse-pane-${legendCardCount}`);
        legendCardHeaderToggle.setAttribute('data-target', `#collapse-pane-${legendCardCount}`);
        legendCardHeaderToggle.setAttribute('data-toggle', 'collapse');

        legendCardHeader.append(legendCardHeaderCheckboxLabel, legendCardHeaderToggle);

        let legendCollapse = document.createElement('div');
        legendCollapse.id = `collapse-pane-${legendCardCount}`;
        legendCollapse.className = collapsed ? 'collapse' : 'collapse show';
        legendCollapse.setAttribute('data-parent', `#${contentHolder.id}`);

        let legendCollapseContent = document.createElement('div');
        legendCollapseContent.className = 'card-body';
        legendCollapse.append(legendCollapseContent);

        this.domNode.append(legendCardHeader, legendCollapse);

        if (legendGroup.layers) {
            legendGroup.layers.forEach(layerGroup => {
                if (layerGroup.layers) {
                    var layerGroupDiv = document.createElement('details');
                    layerGroupDiv.className = 'font-size-legend margin-bot-5';
                    var layerGroupHeader = document.createElement('summary');
                    layerGroupHeader.innerHTML = layerGroup.label;
                    layerGroupDiv.append(layerGroupHeader);

                    layerGroup.layers.forEach(subgroup => {
                        let subLegendCard = document.createElement('div');
                        let subLegendCardHeader = document.createElement('div');
                        subLegendCardHeader.className = 'form-check font-size-legend margin-left-1rem';
                        // subLegendCardHeader.id = idName;

                        let subLegendCardHeaderCheckbox = document.createElement('input');
                        subLegendCardHeaderCheckbox.className = 'form-check-input';
                        subLegendCardHeaderCheckbox.type = 'checkbox';
                        subLegendCardHeaderCheckbox.id = subgroup.id + '_checkbox';
                        subLegendCardHeaderCheckbox['data-layer'] = subgroup.id;
                        subLegendCardHeaderCheckbox.checked = true;
                        map.setLayoutProperty(subgroup.id, 'visibility', visible ? 'visible' : 'none');

                        subLegendCardHeaderCheckbox.addEventListener('change', function(event) {
                            if (this.checked && legendCardHeaderCheckbox.checked) {
                                map.setLayoutProperty(subgroup.id, 'visibility', 'visible');
                            } else {
                                map.setLayoutProperty(subgroup.id, 'visibility', 'none');
                            }
                        })

                        let subLegendCardHeaderCheckboxLabel = document.createElement('label');
                        subLegendCardHeaderCheckboxLabel.className = 'form-check-label';
                        subLegendCardHeaderCheckboxLabel.setAttribute("for", subgroup.id + '_checkbox');
                        subLegendCardHeaderCheckboxLabel.append(subLegendCardHeaderCheckbox);
                        subLegendCardHeaderCheckboxLabel.innerHTML = subgroup.label;

                        subLegendCardHeader.append(subLegendCardHeaderCheckbox, subLegendCardHeaderCheckboxLabel);
                        subLegendCard.append(subLegendCardHeader);
                        layerGroupDiv.append(subLegendCard);
                    });

                    legendCollapseContent.append(layerGroupDiv);
                } else {
                    let subLegendCard = document.createElement('div');
                    let subLegendCardHeader = document.createElement('div');
                    subLegendCardHeader.className = 'form-check font-size-legend';

                    let subLegendCardHeaderCheckbox = document.createElement('input');
                    subLegendCardHeaderCheckbox.className = 'form-check-input';
                    subLegendCardHeaderCheckbox.type = 'checkbox';
                    subLegendCardHeaderCheckbox.id = layerGroup.id + '_checkbox';
                    subLegendCardHeaderCheckbox['data-layer'] = layerGroup.id;
                    subLegendCardHeaderCheckbox.checked = true;
                    // subLegendCardHeaderCheckbox.checked = (visible === 'visible' ? true : false);
                    map.setLayoutProperty(layerGroup.id, 'visibility', visible ? 'visible' : 'none');
                    subLegendCardHeaderCheckbox.addEventListener('change', function(event) {
                        if (this.checked && legendCardHeaderCheckbox.checked) {
                            map.setLayoutProperty(layerGroup.id, 'visibility', 'visible');
                        } else {
                            map.setLayoutProperty(layerGroup.id, 'visibility', 'none');
                        }
                    })

                    let subLegendCardHeaderCheckboxLabel = document.createElement('label');
                    subLegendCardHeaderCheckboxLabel.className = 'form-check-label';
                    subLegendCardHeaderCheckboxLabel.setAttribute("for", layerGroup.id + '_checkbox');
                    subLegendCardHeaderCheckboxLabel.innerHTML = layerGroup.label;

                    subLegendCardHeader.append(subLegendCardHeaderCheckbox, subLegendCardHeaderCheckboxLabel);
                    subLegendCard.append(subLegendCardHeader);
                    legendCollapseContent.append(subLegendCard);
                }
            });
        }
    }
})