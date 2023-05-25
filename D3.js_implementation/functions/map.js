let text;

// Renders the map and can then add the TREE-Data to it.
function drawMap(map, data, select) {
    let projection = d3.geoIdentity().reflectY(true).fitSize([width*0.9, height*0.9], map);// The projection determines what kind of plane the map itself is projected on to (eg. onto a globe or a flat plain).
    let path = d3.geoPath().projection(projection);
    
    updateMap(map, data, select); // Prepare the data that should be rendered (decided by user via selection panel)


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
                        .style("position","absolute");

    let color = d3.scaleSequential()
                    .interpolator(d3.interpolateInferno)
                    .domain([1,100])
    
    let mouseover = function(d) {
        // Highlight selected part
        d3.select(this) 
        .style("stroke", "white")
        .style("stroke-width", 2)
        .style("cursor", "pointer");    // maybe use .classed("canton-highligted", true); ?       

        /* Show tooltip
        tooltip.style("opacity", 0.8)
                .style("z-index", "0");*/
    };

    let current = null; // for enabling toggling of the tooltip box
    let mouseclick = function(d) {
        // Adds the text to the tooltip and updates the position on where the mouse is.
        tooltip.html(createLabel(d))
                .style("left", (d3.mouse(this)[0]+25) + "px")
                .style("top", (d3.mouse(this)[1]) + "px");

        current === this ? tooltip.style("opacity", 0.8) : tooltip.style("opacity", 0)
        current = this;
    };
    
    let mouseleave = function(d) {
        // De-highlight once cursor leaves by changing back the style of the Kanton
        d3.select(this)
            .style("stroke", "white")
            .style("stroke-width", 0.5);   

        /* Hide tooltip
        tooltip.style("opacity", 0)
                .style("z-index", "900");*/
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
            .style("z-index", "950")
        .on("mouseover", mouseover)
        .on("click", mouseclick)
        .on("mouseleave", mouseleave);
}

// Updates the map if the variables change.
function updateMap(map, data, select) {
    let dataByKanton = {};

    data.forEach(function (d) {
        let kanton = d["aes_canton"].includes("Basel") ? "beide Basel (BL/BS)" : d["aes_canton"];
    
        switch (select) {
            case "t0sex" : prepareGender(d, dataByKanton, kanton); break; // Gender
            case "t0immig" : prepareImmigration(d, dataByKanton, kanton); break; // Immigration status
            case "t0fmedu_comp" : prepareParentsEdjuation(d, dataByKanton, kanton); break; // Parents' highest educational attainment [composite]
            case "aes_langreg" : prepareLanguage(d, dataByKanton, kanton); break; // Language region 
            case "t0hisei08_3q" : prepareParentsSES(d, dataByKanton, kanton); break; // Parental socioeconomic status level (tercile)
            case "t0wlem_3q" : prepareMathScore(d, dataByKanton, kanton); break; // Math score level (tercile)
            case "t0st_nprog_req3" : prepareNSP(d, dataByKanton, kanton); break; // National school programme (requirements)
            case "t1educ_class_1_r" : prepareEduStatus1(d, dataByKanton, kanton); break; // Educational status t1
            case "t2educ_class_1_r" : prepareEduStatus2(d, dataByKanton, kanton); break; // Educational status t2
            case "t3educ_class_1_r" : prepareEduStatus3(d, dataByKanton, kanton); break; // Educational status t3
            default : break;
        }
      });

    //always do this
    prepareMapData(map, dataByKanton);
}

function createLabel(d) {
  let properties = d.properties;
  let details = properties.details;

  return "<p><b>" + properties.KantonName_de + " (" + d.properties.alternateName + ")</b></p>" +
        "<p>" + "Gesammtteilnehmer: " + details.both + "</p>" +
        "<p>" + "Weibliche Teilnehmer: " + details.female + "</p>" +
        "<p>" + "Männliche Teilnehmer: " + details.male + "</p>"/* +
        "<p>" + "Immigrationstatus 1: " + details.immigration_1 + "</p>" +
        "<p>" + "Immigrationstatus 2: " + details.immigration_2 + "</p>" +
        "<p>" + "Immigrationstatus 3: " + details.immigration_3 + "</p>" +
        "<p>" + "Percent Immigration 1: " + details.percent_immigration_1 + "</p>" +
        "<p>" + "Percent Immigration 2: " + details.percent_immigration_2 + "</p>" +
        "<p>" + "Percent Immigration 3: " + details.percent_immigration_3 + "</p>"*/;
}


function prepareImmigration(d, dataByKanton, kanton) {
  let immigration = d["t0immig"]; // immigration status (1 - native, 2 - second gen, 3 - first gen, . - missing)
  let IPW1 = d["t1wt"]; // Inverse Probability Weight - Wave 1

  assignData(dataByKanton[kanton], {immigration_1: 0, immigration_2: 0, immigration_3: 0});
  assignData(dataByKanton["sum"], {immigration_1: 0, immigration_2: 0, immigration_3: 0});

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



function prepareGender(d, dataByKanton, kanton) {
  let gender = d["t0sex"];

  dataByKanton[kanton] = assignData(dataByKanton[kanton], {both: 0, female: 0, male: 0,});
  dataByKanton["sum"] = assignData(dataByKanton["sum"], {both: 0, female: 0, male: 0,});

  if (gender === "Female") {
    dataByKanton[kanton].female += 1;
    dataByKanton["sum"].female += 1;

  } else if (gender === "Male") {
    dataByKanton[kanton].male += 1;
    dataByKanton["sum"].male += 1;
  }
  dataByKanton[kanton].both += 1;
  dataByKanton["sum"].both += 1;
}

function assignData(data, variables) {
  if (!data) {
    data = variables;
  }
  return data;
}

function prepareMapData(map, dataByKanton) {
    
  map.features.forEach(function (d) {
    d.properties.details = dataByKanton[d.properties.KantonName_de + " (" + d.properties.alternateName + ")"] ?
        dataByKanton[d.properties.KantonName_de + " (" + d.properties.alternateName + ")"] : dataByKanton[d.properties.KantonName_fr + " (" + d.properties.alternateName + ")"] ?
        dataByKanton[d.properties.KantonName_fr + " (" + d.properties.alternateName + ")"] : dataByKanton[d.properties.KantonName_it + " (" + d.properties.alternateName + ")"] ?
        dataByKanton[d.properties.KantonName_it + " (" + d.properties.alternateName + ")"] : dataByKanton[d.properties.KantonName_en + " (" + d.properties.alternateName + ")"];

});


}
