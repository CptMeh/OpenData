/* 
Renders the map itself and (once we get it to work) can then add the TREE-Data to it.
*/
function drawMap(map, data) {
  const projection = d3.geoIdentity().fitSize([width, height], map);// The projection determines what kind of plane the map itself is projected on to (eg. onto a globe or a flat plain).
  const path = d3.geoPath().projection(projection); // Idk what dis doo yet :/ I think it renders the kantone?
  const dataByKanton = prepareData(data, "gender");// Prepare the data that should be rendered (decided by user via selection panel)

  prepareMapData(map, dataByKanton);

  // Add tooltip Text
  d3.tip()
  .attr('class', 'd3-tip')
  .attr("id", "tool-" + d.properties.alternateName)
  .html(createLabel(d));

  svg.selectAll("path")
    .data(map.features)
    .enter()
    .append("path")
    .attr("name", function(d) {
      return d.properties.name;
    })
    .attr("d", path) // Idk 
    .style("fill", "grey") // Set the background color of the Kantons
    .style("stroke", "white") // Set the color of the Kanton Borders
    .style("stroke-width", 0.5) // Thickness of the borderlines

    // Highlights the Kanton the mouse is hovering over by changing the style.
    // It also shows a little text field 
    .on("mouseover", function(d) {
      // Highlight selected part
      d3.select(this) 
        .style("stroke", "white")
        .style("stroke-width", 2)
        .style("cursor", "pointer");    // maybe use .classed("canton-highligted", true); ?       

      // Add Text info about selected part
      //addTextBox(d);

      
    })
    .on("mouseover", )
    // De-highlight once cursor leaves by changing back the style of the Kanton
    .on("mouseout", function(d) {
      d3.select(this)
        .style("stroke", "white")
        .style("stroke-width", 0.5);   

      d3.tip()
        .hide();
    });
}

function createLabel(d) {
  let properties = d.properties;
  let details = properties.details;

  return "<p>" + properties.KantonName_de + " (" + d.properties.alternateName + ")</p>" +
  "<p>" + "Gesammtteilnehmer: " + details.both + "</p>" +
  "<p>" + "Weibliche Teilnehmer: " + details.female + "</p>" +
  "<p>" + "Männliche Teilnehmer: " + details.male + "</p>" +
  "<p>" + "Immigrationstatus 1: " + details.immigration_1 + "</p>" +
  "<p>" + "Immigrationstatus 2: " + details.immigration_2 + "</p>" +
  "<p>" + "Immigrationstatus 3: " + details.immigration_3 + "</p>" +
  "<p>" + "Percent Immigration 1: " + details.percent_immigration_1 + "</p>" +
  "<p>" + "Percent Immigration 2: " + details.percent_immigration_2 + "</p>" +
  "<p>" + "Percent Immigration 3: " + details.percent_immigration_3 + "</p>";
}

/*
function showFullData(dataByKanton) {
  let data = dataByKanton["sum"];
 
  var arr = ["Alle Kantone",
    "Gesammtteilnehmer: " + data.both,
    "Weibliche Teilnehmer: " + data.female,
    "Männliche Teilnehmer: " + data.male,
    "Immigrationstatus 1: " + data.immigration_1,
    "Immigrationstatus 2: " + data.immigration_2,
    "Immigrationstatus 3: " + data.immigration_3,
    "Percent Immigration 1: " + data.percent_immigration_1,
    "Percent Immigration 2: " + data.percent_immigration_2,
    "Percent Immigration 3: " + data.percent_immigration_3];

  // Remove previous text
  d3.select("#canton-info")
  .selectAll("p")
  .remove(); 

  d3.select("#canton-info")
    .append("p")
    .html(arr.join('<br/><br/>'));
}*/

function prepareData(data, select) {
  let dataByKanton = {};

  data.forEach(function (d) {
    let kanton = d["aes_canton"].includes("Basel") ? "beide Basel (BL/BS)" : d["aes_canton"];

    switch (select) {
      case "gender" : prepareGender(d, dataByKanton, kanton); break;
      case "immigratoin" : prepareImmigration(d, dataByKanton, kanton); break;
      case "" : break;
      default : break;
    }
  });
  return dataByKanton;
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

/*
function addTextBox(d, obj) {
  let arr = [d.properties.KantonName_de + " (" + d.properties.alternateName + ")",
  "Gesammtteilnehmer: " + d.properties.details.both,
  "Weibliche Teilnehmer: " + d.properties.details.female,
  "Männliche Teilnehmer: " + d.properties.details.male,
  "Immigrationstatus 1: " + d.properties.details.immigration_1,
  "Immigrationstatus 2: " + d.properties.details.immigration_2,
  "Immigrationstatus 3: " + d.properties.details.immigration_3,
  "Percent Immigration 1: " + d.properties.details.percent_immigration_1,
  "Percent Immigration 2: " + d.properties.details.percent_immigration_2,
  "Percent Immigration 3: " + d.properties.details.percent_immigration_3];

  //d3.select("#canton-info")
  obj.append("p")
    .html(arr.join('<br/><br/>'));
}*/

function prepareMapData(map, dataByKanton) {
  map.features.forEach(function (d) {
    d.properties.details = dataByKanton[d.properties.KantonName_de + " (" + d.properties.alternateName + ")"] ?
      dataByKanton[d.properties.KantonName_de + " (" + d.properties.alternateName + ")"] : dataByKanton[d.properties.KantonName_fr + " (" + d.properties.alternateName + ")"] ?
        dataByKanton[d.properties.KantonName_fr + " (" + d.properties.alternateName + ")"] : dataByKanton[d.properties.KantonName_it + " (" + d.properties.alternateName + ")"];
  });
}