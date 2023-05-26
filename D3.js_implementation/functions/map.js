let map;
let data;
let text;

// Renders the map and can then add the TREE-Data to it.
function drawMap(m, d) {
    map = m;
    data = d;
    let projection = d3.geoIdentity().reflectY(true).fitSize([width*0.9, height*0.9], map);// The projection determines what kind of plane the map itself is projected on to (eg. onto a globe or a flat plain).
    let path = d3.geoPath().projection(projection);
    
    updateMap("t0sex"); // Prepare the data that should be rendered (decided by user via selection panel)

    let tooltip = d3.select("#map")
                    .append("div")
                    .attr("id", "tooltip")
                    // Somehow the following is not added via id. find out why
                    .style("opacity", 0)
                    .attr("class", "tooltip")
                    .style("background-color", "white")
                    .style("border", "solid")
                    .style("border-width", "2px")
                    .style("border-radius", "5px")
                    .style("padding", "5px")
                    .style("position","absolute")
                    .style("pointer-events", "none"); /*This makes the tooltip unclickable, so it doesn't block the canton behind it, once it is made invisible again. 
                                                        However, this hinders the user from copying the info in the box, not very handy :/ */

    let color = d3.scaleSequential()
                    .interpolator(d3.interpolateInferno)
                    .domain([1,100]);

    let current = null; // for enabling toggling of the tooltip box
    let clicked = false;
    let mouseclick = function(d) {
        // Adds the text to the tooltip and updates the position on where the mouse is.
        tooltip.html(createLabel(d))
                .style("left", (d3.mouse(this)[0]) + "px")
                .style("top", (d3.mouse(this)[1]) + "px");

        if (current === this && clicked) {
            tooltip.style("opacity", 0.0) // make tooltip visible
                    .style("z-index", "0"); // make it go behind the cantons, so it doesn't block them
            clicked = false;
        } else {
            tooltip.style("opacity", 0.8)
                    .style("z-index", "2");
            clicked = true;
        }
        current = this;
    };

    let mouseover = function(d) {
        // Highlight selected part
        d3.select(this) 
        .style("stroke", "white")
        .style("stroke-width", 2)
        .style("cursor", "pointer");    // maybe use .classed("canton-highligted", true); ?       
    };
    
    let mouseleave = function(d) {
        // De-highlight once cursor leaves by changing back the style of the Kanton
        d3.select(this)
            .style("stroke", "white")
            .style("stroke-width", 0.5);   
    };

    svg.selectAll("path")
        .data(map.features)
        .enter()
        .append("path")
            .attr("class", "canton")
            .attr("id", function(d) { return d.properties.KantonId; })
            .attr("d", path)
            .style("fill", "grey") // Set the background color of the Kantons
            .style("stroke", "white") // Set the color of the Kanton Borders
            .style("stroke-width", 0.5) // Thickness of the borderlines
            .style("z-index", "1")
        .on("mouseover", mouseover)
        .on("click", mouseclick)
        .on("mouseleave", mouseleave);
}

// Updates the map if the variables change.
function updateMap(select) {
    let dataByKanton = {};
    let values = {};

    values = getValues(dataByKanton, select);

    dataByKanton = Array.apply(null, Array(27)).map(function (x) { return values; });

    data.forEach(function (d) {
        prepare(d, dataByKanton, select, values);
    });

    prepareMapData(map, dataByKanton);
}


function getValues(dataByKanton, select) {
    switch (select) {
        case "t0sex": return { both: 0, 1: 0, 2: 0, };  // Gender


        case "t0immig" : return { both: 0, 1: 0, 2: 0, 3: 0, other: 0,}; // Immigration status
        //case "t0fmedu_comp" : prepare(d, dataByKanton, kanton, "t0fmedu_comp", {compusory_school: 0, upper_secondary: 0, tertiary: 0, other: 0,}); break; // Parents' highest educational attainment [composite]
        case "aes_langreg": return { 1: 0, 2: 0, 3: 0, other: 0,};  // Language region 
        case "t0hisei08_3q": return { 1: 0, 2: 0, 3: 0, other: 0, };  // Parental socioeconomic status level (tercile)
        case "t0wlem_3q": return { 1: 0, 2: 0, 3: 0, other: 0, };  // Math score level (tercile)
        case "t0st_nprog_req3": return { 1: 0, 2: 0, 3: 0, other: 0, };  // National school programme (requirements)
        case "t1educ_class_1_r": ; // Educational status t1
        case "t2educ_class_1_r": ; // Educational status t2
        case "t3educ_class_1_r": return ; // Educational status t3
        default: console.log("no"); return {};
    }
}

function prepare(d, dataByKanton, select, values) {
    let variable = d[select];
    let kanton = d["aes_canton"];

    if (values.hasOwnProperty(variable)) {
        dataByKanton[kanton][variable] += 1;
    } else {
        dataByKanton[kanton].other += 1;
    }
    //text = createLabel(d, select);
}

function prepareMapData(map, dataByKanton) {
    map.features.forEach(function (d) {
        let p = d.properties;

        d.properties.details = dataByKanton[p.KantonId];
    });
}


function createLabel(d) {
    let details = d.properties.details;
    let label = "<p><b>" + d.properties.KantonName_de + " (" + d.properties.alternateName + ")</b></p>";
    let select = "t0immig";

    switch(select) {
        case "t0sex" :  label += "<p>" + "Gesammt: " + (details["1"] + details["1"]) + "</p>" +
                                "<p>" + "Weiblich: " + details["1"] + "</p>" +
                                "<p>" + "Männlich: " + details["2"] + "</p>"; 
                        break;
        case "t0immig": label += "<p>" + "Immigrationstatus 1: " + details.immigration_1 + "</p>" +
                                "<p>" + "Immigrationstatus 2: " + details.immigration_2 + "</p>" +
                                "<p>" + "Immigrationstatus 3: " + details.immigration_3 + "</p>" +
                                "<p>" + "Percent Immigration 1: " + details.percent_immigration_1 + "</p>" +
                                "<p>" + "Percent Immigration 2: " + details.percent_immigration_2 + "</p>" +
                                "<p>" + "Percent Immigration 3: " + details.percent_immigration_3 + "</p>"; 
                        break; 
        default : break;
    }

    return label;
}

function prepareImmigration(d, dataByKanton, kanton) {
    let immigration = d["t0immig"]; // immigration status (1 - native, 2 - second gen, 3 - first gen, . - missing)
    let IPW1 = d["t1wt"]; // Inverse Probability Weight - Wave 1

    dataByKanton[kanton] = assignVariables(dataByKanton[kanton], {immigration_1: 0, immigration_2: 0, immigration_3: 0});
    dataByKanton["sum"] = assignVariables(dataByKanton["sum"], {immigration_1: 0, immigration_2: 0, immigration_3: 0});

    switch (immigration) {
        case "Native (at least 1 parent born in Switzerland)": dataByKanton[kanton].immigration_1 += 1 * IPW1;
        case "Second generation (respondent born in Switzerland, no parent born in Switzerland)": dataByKanton[kanton].immigration_2 += 1 * IPW1;
        case "First generation (respondent and parent(s) born abroad)": dataByKanton[kanton].immigration_3 += 1 * IPW1;
        case ".": dataByKanton[kanton].immigration_4 += 1 * IPW1;
    }

    // needed for converting the totals to percent
    total_immigration_weighted = dataByKanton[kanton].immigration_1 
                                    + dataByKanton[kanton].immigration_2 
                                    + dataByKanton[kanton].immigration_3 
                                    + dataByKanton[kanton].immigration_4;

    dataByKanton[kanton].percent_immigration_1 = (100 / total_immigration_weighted) * dataByKanton[kanton].immigration_1;
    dataByKanton[kanton].percent_immigration_2 = (100 / total_immigration_weighted) * dataByKanton[kanton].immigration_2;
    dataByKanton[kanton].percent_immigration_3 = (100 / total_immigration_weighted) * dataByKanton[kanton].immigration_3;
}

function prepareParentsEdjuation(d, dataByKanton, kanton) {
    let education = d["t0fmedu_comp"];

    dataByKanton[kanton] = assignVariables(dataByKanton[kanton], {compusory_school: 0, upper_secondary: 0, tertiary: 0, other: 0,});

    switch (education) {
        case "Compulsory schooling only" : dataByKanton[kanton].compusory_school += 1; break;
        case "Upper secondary education" : dataByKanton[kanton].upper_secondary += 1; break;
        case "Tertiary education" : dataByKanton[kanton].tertiary += 1; break;
        default : dataByKanton[kanton].other += 1; break;
    }
}

function prepareParentsSES(d, dataByKanton, kanton) {
    let parentsSES = d["t0hisei08_3q"];

    dataByKanton[kanton] = assignVariables(dataByKanton[kanton], {Low: 0, Medium: 0, High: 0, other: 0,});

    switch (parentsSES) {
        case "Low" : dataByKanton[kanton].low += 1; break;
        case "Medium" : dataByKanton[kanton].medium += 1; break;
        case "High" : dataByKanton[kanton].high += 1; break;
        default : dataByKanton[kanton].other += 1; break;
    }
}

function prepareMathScore(d, dataByKanton, kanton) {
    let parentsSES = d["t0hisei08_3q"];

    dataByKanton[kanton] = assignVariables(dataByKanton[kanton], {low: 0, medium: 0, high: 0, other: 0,});

    switch (parentsSES) {
        case "Low" : dataByKanton[kanton].low += 1; break;
        case "Medium" : dataByKanton[kanton].medium += 1; break;
        case "High" : dataByKanton[kanton].high += 1; break;
        default : dataByKanton[kanton].other += 1; break;
    }
}
