define(
    [
        "./app/components/filterMenu/queryString.js",
        "./app/staticData/crashAttr.js",
    ], function (
        queryString,
        crashAttributes
    ) {
        return function ReportParameters() {

            this.initiate = function (filterParameters) {
                const attributes = crashAttributes.getCrashAttributes();
                var checkboxList = new CheckboxArray(attributes, filterParameters)
                document.getElementById('crash-attribute-list').append(checkboxList.domNode);

                initalizeSortOptions(filterParameters);
            }

            //#region Crash Attribute Report Tables
            function CheckboxArray(attributes, filterParameters) {
                var self = this;

                this.domNode = document.createDocumentFragment();

                attributes.forEach(element => {
                    var checkbox = new Checkbox(element.label, element.value, filterParameters)
                    self.domNode.append(checkbox.domNode);
                });
            }

            function Checkbox(label, value, filterParameters) {
                var idString = value + "-checkbox";

                this.domNode = document.createElement('div')
                this.domNode.className = 'form-check';

                // var labelString = '<label class="form-check-label" for="' + idString + '">';
                var inputLabel = document.createElement('label');
                // inputLabel.className = 'form-check-input'
                inputLabel.for = idString;
                inputLabel.innerHTML = label;

                // var inputString = '<input id="' + idString + '" class="form-check-input" type="checkbox" value="' + value + '">';
                var inputBox = document.createElement('input');
                inputBox.id = idString;
                inputBox.className = 'form-check-input';
                inputBox.type = 'checkbox';
                inputBox.value = value;
                inputLabel.onchange = function (event){
                    var checked = event.target.checked;
                    handleAttribute(value, checked, label, filterParameters);
                }

                inputLabel.prepend(inputBox);
                this.domNode.append(inputLabel);
            }

            function handleAttribute(value, checked, label, filterParameters) {
                if(checked) {
                    if (filterParameters.reportParameters.crashAttributes.values.indexOf(value) === -1) {
                        filterParameters.reportParameters.crashAttributes.values.push(value);
                        filterParameters.reportParameters.crashAttributes.labels.push(label);
                    }
                }
                else {
                    for (var i= filterParameters.reportParameters.crashAttributes.values.length-1; i >= 0; i--) {
                        if (filterParameters.reportParameters.crashAttributes.values[i] === value) {
                            filterParameters.reportParameters.crashAttributes.values.splice(i, 1);
                            filterParameters.reportParameters.crashAttributes.labels.splice(i, 1);
                            break;
                        }
                    }        
                }
                queryString.updateQueryString(filterParameters);
                console.log("Crash Attributes: ");
                console.log(filterParameters);   
            }
            //#endregion Crash Attribute Report Tables

            //#region Report Sort Radio buttons
            function initalizeSortOptions(filterParameters) {
                $("#crash-sort,#fatal-sort,#mp-sort").on('change', function (e) {
                    var label = $(this).prop("labels");
                    filterParameters.updateSort($(label).text(), e.target.value);
                    queryString.updateQueryString(filterParameters);
                });
            }

            //#endregion

        }
    }
)