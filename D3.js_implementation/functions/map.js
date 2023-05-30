let select, subselect, text;

// Renders the map and can then add the TREE-Data to it.
function drawMap(map, data) {
    let projection = d3.geoIdentity().reflectY(true).fitSize([width*0.9, height*0.9], map);// The projection determines what kind of plane the map itself is projected on to (eg. onto a globe or a flat plain).
    let path = d3.geoPath().projection(projection); // Create the path for the projection
    
    setSelected("t1educ_class_1_r", "NET");
    connectDataToMap(data, map); // Prepare the data that should be rendered

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
        tooltip.html(createLabel(d))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");
      
        if (current === this && clicked) {
            tooltip.style("opacity", 0.0) // makes tooltip visible
                    .style("z-index", "0"); // makes it go behind the cantons, so it doesn't block them
            clicked = false;
        } else {
            tooltip.style("opacity", 0.9)
                    .style("z-index", "2");
            clicked = true;
        }
        current = this;
    };

    let mouseover = function(d)  {
        // Highlight selected part
        d3.select(this) 
        .style("stroke", "gray")
        .style("stroke-width", 2)
        .style("cursor", "pointer");    // maybe use .classed("canton-highligted", true); ?       
    };
    
    let mouseleave = function(d) {
        // De-highlight once cursor leaves by changing back the style of the Kanton
        d3.select(this)
            .style("stroke", "gray")
            .style("stroke-width", 0.5);   
    };

    svg.selectAll("path")
        .data(map.features)
        .enter()
        .append("path")
        .attr("class", "canton")
        .attr("id", function(d) { return d.properties.KantonId; })
        .attr("d", path)
        .on("mouseover", mouseover)
        .on("click", mouseclick)
        .on("mouseleave", mouseleave);

    colorMap();
    addColorScale();
}

function colorMap() {
    d3.selectAll("path")
        .style("fill", function(d) { return createColorArray(d)})
        .style("stroke", "gray")
        .style("stroke-width", 0.5);;

}

function createColorArray(d){
    const inPercent = percentage(d.properties.details[select]);

    // Define the color scale
    const colorScale = d3.scaleLinear()
                        .domain([0, 100])
                        .range(["#ffffff", "#030303"]); // Specify the color range
    

    return colorScale(inPercent[subselect]).toString()
}


function addColorScale() {
        const scale = d3.scaleLinear()
                        .domain([0, 100])
                        .range(["#ffffff", "#030304"]);
        const rectWidth = 8;
        const rectHeight = 50;
    
        for (let i = 0; i <= 100; i++){
            svg.append("g")
                .append("rect")
                .attr("width", rectWidth)
                .attr("height", rectHeight)
                .attr("id", i)
                .style("fill", function() {return scale(i);})
                .attr("x", i*rectWidth)
                .attr("y", 0);
    
            // Create the text element and position it in the center of the rectangle
           
            if (i % 25 === 0 || i === 100) {
                svg.append("g")
                .append("foreignObject")
                .attr("width", 100)
                .attr("height", rectHeight)
                .attr("x", i*rectWidth)
                .attr("y", rectHeight)
                .html("<div>" + i + "%</div>");            
            }
    
            
        }
    
    

}

// Updates the map if the variables change.
function connectDataToMap(data, map) {
    let dataByKanton = Array.apply(null, Array(27)).map(x => { return getValues(); });

    data.forEach(function(d) { prepareData(d, dataByKanton); });

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
    let weighted_vars = ["t1educ_class_1_r", "t2educ_class_1_r", "t3educ_class_1_r"];
    let weights = ["t1wt", "t2wt", "t3wt"];

    vars.forEach(function(i) {
        if (dataByKanton[id][i].hasOwnProperty(dataVar[i])) {
            dataByKanton[id][i][dataVar[i]] += 1;
        } else {
            dataByKanton[id][i].other += 1;
        }
       // console.log(dataVar[id][i]);
    });
    let j = 0;
    weighted_vars.forEach(function(i) {
        if (dataByKanton[id][i].hasOwnProperty(dataVar[i])) {
            dataByKanton[id][i][dataVar[i]] += parseFloat(dataVar[weights[j]]);
        } else {
            dataByKanton[id][i].other += parseFloat(dataVar[weights[j]]);
        }
        j++;
    });


}

function prepareMapData(map, dataByKanton) {
    map.features.forEach(function(d) {
        d.properties.details = dataByKanton[d.properties.KantonId];
    });
}

function percentage(detail) {
    let max = 0;
    let result = structuredClone(detail); // so it doesn't overwrite the actual data

    for (let key in result) { 
        max += result[key];
    }

    for (let key in result) { 
        result[key] = ((100/max)*result[key]).toFixed(2);
    }

    return result;
}


function createLabel(mapData) {
    let label = "<p><b>" + mapData.properties.KantonName_de + " (" + mapData.properties.alternateName + ")</b></p>";
    let details = mapData.properties.details[select];

    for (let key in details) {
        label += "<p><b>" + key + ":</b> " + details[key].toFixed(0) + " (" + percentage(details)[key] + "%)</p>";
    }
    
    return label;    
}

function setSelected(newSelect, newSubSelected) {
    select = newSelect;
    subselect = newSubSelected;
}