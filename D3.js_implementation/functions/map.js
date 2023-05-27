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
                    .style("overflow", "scroll")
                    .style("pointer-events", "none"); /*This makes the tooltip unclickable, so it doesn't block the canton behind it, once it is made invisible again. 
                                                        However, this hinders the user from copying the info in the box, not very handy :/ */

    let current = null; // for enabling toggling of the tooltip box
    let clicked = false;
    let mouseclick = function(d) {
        // Adds the text to the tooltip and updates the position on where the mouse is.
        tooltip.html(createLabel(d, select))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");
      
        if (current === this && clicked) {
            tooltip.style("opacity", 0.0) // make tooltip visible
                    .style("z-index", "0"); // make it go behind the cantons, so it doesn't block them
            clicked = false;
        } else {
            tooltip.style("opacity", 0.9)
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
    let dataByKanton = Array.apply(null, Array(27)).map(function (x) { 
        return getValues(); 
    });
    
    setSelect(select);

    data.forEach(function (d) {
        prepareData(d, dataByKanton);
    });

    prepareMapData(map, dataByKanton);
}


function getValues() {
    return {"t0sex": {"Female": 0, "Male": 0}, // Gender
            "t0immig" : {"Native (at least 1 parent born in Switzerland)": 0, "Second generation (respondent born in Switzerland, no parent born in Switzerland)": 0, "First generation (respondent and parent(s) born abroad)": 0}, // Immigration status
            "t0fmedu_comp" : {"Compulsory schooling only": 0, "Upper secondary education": 0, "Tertiary education": 0}, // Parents' highest educational attainment [composite]
            "aes_langreg": {"German": 0, "French": 0, "Italian": 0}, // Language region 
            "t0hisei08_3q": {"Low": 0, "Medium": 0, "High": 0}, // Parental socioeconomic status level (tercile)
            "t0wlem_3q": {"Low": 0, "Medium": 0, "High": 0}, // Math score level (tercile)
            "t0st_nprog_req3": {"High requirements": 0, "Advanced requirements & Alternative/non-assignable study programme": 0, "Basic/low requirements": 0}, // National school programme (requirements)
            "t1educ_class_1_r": {"NET": 0, "Internship": 0, "10th school year": 0,"Other intermediate solution": 0, "2 years VET": 0, "3-4 years VET": 0, "Vocational baccalaureate //VET": 0, "General baccalaureate": 0, "Other general education programme (specialized middle school, Waldorf)": 0}, // Educational status t1
            "t2educ_class_1_r": {"NET": 0, "Internship": 0, "10th school year": 0,"Other intermediate solution": 0, "2 years VET": 0, "3-4 years VET": 0, "Vocational baccalaureate //VET": 0, "General baccalaureate": 0, "Other general education programme (specialized middle school, Waldorf)": 0}, // Educational status t2
            "t3educ_class_1_r": {"NET": 0, "Internship": 0, "10th school year": 0,"Other intermediate solution": 0, "2 years VET": 0, "3-4 years VET": 0, "Vocational baccalaureate //VET": 0, "General baccalaureate": 0, "Other general education programme (specialized middle school, Waldorf)": 0}}; // Educational status t3

}

function prepareData(dataVar, dataByKanton) {
    let id = dataVar["aes_canton"];
    let vars = ["t0sex", "t0immig", "t0fmedu_comp", "aes_langreg", "t0hisei08_3q", "t0wlem_3q", "t0st_nprog_req3"];
    let wheightet = ["t1educ_class_1_r", "t2educ_class_1_r", "t3educ_class_1_r"];

    vars.forEach(function(i){
        if (dataByKanton[id][i].hasOwnProperty(dataVar[i])) {
            dataByKanton[id][i][dataVar[i]] += 1;
        } else {
            dataByKanton[id][i].other += 1;
        }
    });

    wheightet.forEach(function(i){
        if (dataByKanton[id][i].hasOwnProperty(dataVar[i])) {
            switch (i) {
                case "t1educ_class_1_r" : dataByKanton[id]["t1educ_class_1_r"][dataVar[i]] += 1 * dataVar["t1wt"]; break;
                case "t2educ_class_1_r" : dataByKanton[id]["t1educ_class_1_r"][dataVar[i]] += 1 * dataVar["t2wt"]; break;
                case "t3educ_class_1_r" : dataByKanton[id]["t1educ_class_1_r"][dataVar[i]] += 1 * dataVar["t3wt"]; break;
                                                           // Temp. all to t1
            }
        } 
    });
}

function prepareMapData(map, dataByKanton) {
    map.features.forEach(function (d) {
        d.properties.details = dataByKanton[d.properties.KantonId];
    });

    //console.log(map.features[0].properties.details)
}


function createLabel(mapData, select) {
    let label = "<p><b>" + mapData.properties.KantonName_de + " (" + mapData.properties.alternateName + ")</b></p>";
    let details = mapData.properties.details[select];

    for (let key in details) {
        label += "<p><b>" + key + ":</b> " + details[key] + "</p>";
    }
    
    return label;    
}

function setSelect(newSelect) {
    select = newSelect;
}