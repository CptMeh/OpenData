
let varcheck = d3.select("#var-check");

function addChecks(data) {
    data.aes_canton.forEach(function(d) {
        varcheck.append("input")
                .attr("type","checkbox")
                .attr("id", function(d) { return d });
        varcheck.append("label")
                .attr("for", function(d) { return d });
    });
}