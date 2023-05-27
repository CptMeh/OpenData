let select;
let text;

// Renders the map and can then add the TREE-Data to it.
function drawMap(map, data) {
    let projection = d3.geoIdentity().reflectY(true).fitSize([width*0.9, height*0.9], map);// The projection determines what kind of plane the map itself is projected on to (eg. onto a globe or a flat plain).
    let path = d3.geoPath().projection(projection); // Create the path for the projection
    
    updateMap(data, map, "t0sex"); // Prepare the data that should be rendered (decided by user via selection panel)

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

    let current = null; // for enabling toggling of the tooltip box
    let clicked = false;
    let mouseclick = function(d) {
        // Adds the text to the tooltip and updates the position on where the mouse is.
        tooltip.html(createLabel(d, select))
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
function updateMap(data, map, select) {
    let dataByKanton = {};
    let values = {};
    
    setSelect(select);

    values = getValues();

    dataByKanton = Array.apply(null, Array(27)).map(function (x) { return values; });

    data.forEach(function (d) {
        prepareData(d, dataByKanton);
    });

    prepareMapData(map, dataByKanton);
}


function getValues() {
    return {"t0sex": { "Female": 0, "Male": 0, other: 0,}, // Gender
            "t0immig" : { 1: 0, 2: 0, 3: 0, other: 0,}, // Immigration status
            //"t0fmedu_comp" : {compusory_school: 0, upper_secondary: 0, tertiary: 0, other: 0,}, // Parents' highest educational attainment [composite]
            "aes_langreg": { 1: 0, 2: 0, 3: 0, other: 0,}, // Language region 
            "t0hisei08_3q": { 1: 0, 2: 0, 3: 0, other: 0, }, // Parental socioeconomic status level (tercile)
            "t0wlem_3q": { 1: 0, 2: 0, 3: 0, other: 0, }, // Math score level (tercile)
            "t0st_nprog_req3": { 1: 0, 2: 0, 3: 0, other: 0, }, // National school programme (requirements)
            "t1educ_class_1_r": {}}; // Educational status t1
            // Achtung!: t2 und t3 fehlen!!!!

    /*
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
        default: return {other: 0,};
    }*/
}

function prepareData(dataVar, dataByKanton) {
    let id = dataVar["aes_canton"];
    let vars = ["t0sex", "t0immig", "aes_langreg", "t0hisei08_3q", "t0wlem_3q", "t0st_nprog_req3", "t1educ_class_1_r"];
    
    vars.forEach(function(i){
        /*switch (dataVar[i]) {
            case "1" : dataByKanton[id][i]["1"] += 1; break;
            case "2" : dataByKanton[id][i]["2"] += 1; break;
            case "3" : dataByKanton[id][i]["3"] += 1; break;
            default : dataByKanton[id][i].other += 1;
        }*/
        console.log(i)

        console.log(dataVar[i])
        if (dataByKanton[id][i].hasOwnProperty(dataVar[i])) {
            dataByKanton[id][i][dataVar[i]] += 1;
        } else {
            dataByKanton[id][i].other += 1;
        }
    });
}

function prepareMapData(map, dataByKanton) {
    map.features.forEach(function (d) {
        let p = d.properties;

        d.properties.details = dataByKanton[p.KantonId];
    });
}


function createLabel(mapData, select) {
    let details = mapData.properties.details[select];

    let label = "<p><b>" + mapData.properties.KantonName_de + " (" + mapData.properties.alternateName + ")</b></p>";

    for (let property in details) {
        label += "<p>" + property + ": " + (details["1"] + details["2"]) + "</p>";
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


function setSelect(newSelect) {
    select = newSelect;
}