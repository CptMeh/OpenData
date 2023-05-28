
let varcheck = d3.select("#var-check");

function addChecks(labels) {
    let div;
    let check;

    for (let i = 0; i < labels.length; i++) {
        div = varcheck.append("div")
                        .attr("class", "form-check");

        check = div.append("input")
                    .attr("type","radio")
                    .attr("class", "form-check-input")
                    .attr("name", "radio-group")
                    .attr("value", labels[i]["label"])
                    .attr("id", labels[i]["label"])
                    .on("change", function() {
                        if (this.checked) {
                            setSelect(this.value);
                        }
                    });
        
        if (i === 0) {
            check.attr("checked", "true");
        }

        div.append("label")
            .attr("for", labels[i]["label"])
            .html("<p>"+labels[i]["name"]+"</p>");
    }
}