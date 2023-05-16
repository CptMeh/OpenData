// Maybe language?
// let language = ...;

// Make this dynamic!
let width = window.innerWidth * 0.6; 
let height = window.innerHeight * 0.8; 


// Add an SVG to the div with the ID 'map' and then sets its height and width.
const svg = d3.select("#map")
              .append("svg")
              .attr("width", width)
              .attr("height", height)
              .attr("preserveAspectRatio", "xMinYMax"); 

// Get the map- and TREE-data and check if everything worked. Then use the drawMap function to render the map.
d3.queue()
  // This one is the Swiss-Map-Geo-Data
  .defer(d3.json, "https://data.geo.admin.ch/ch.bafu.landesforstinventar-kantone/landesforstinventar-kantone/landesforstinventar-kantone_2056.geojson")
  
  // This one is the TREE-Data
  .defer(d3.csv, "https://raw.githubusercontent.com/CptMeh/OpenData/main/Daten/TREE2_Data_IWI_Open_Data_Vorlesung_2023_label.csv")

  // Wait till all the data is ready
  .await(function (error, map, data) {
      if (error) {
        console.error("Somthing went wrong: " + error);
      } else {
        drawMap(map, data);
      }
  });




  /* Renders the map itself and (once we get it to work) can then add the TREE-Data to it. (not implemented ye ,:D)*/
function drawMap(map, data /*, index*/) {
  // The projection determines what kind of plane the map itself is projected on to (eg. onto a globe or a flat plain).
  const projection = d3.geoIdentity().fitSize([width, height], map);

  // Idk what dis doo yet :/ I think it renders the kantone?
  const path = d3.geoPath().projection(projection);

  let color = d3.scaleThreshold()
                .domain([10000, 100000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000, 500000000, 1500000000])
                .range(["#f7fcfd", "#e0ecf4", "#bfd3e6", "#9ebcda", "#8c96c6", "#8c6bb1", "#88419d", "#810f7c", "#4d004b"]);

  // Prepare the data that should be rendered (decided by user via selection panel)
  let dataByKanton = prepareData(data/*, select*/);


  map.features.forEach(function(d) {
    d.properties.details = dataByKanton[d.properties.KantonName_de +" (" + d.properties.alternateName + ")"] ? 
                            dataByKanton[d.properties.KantonName_de +" (" + d.properties.alternateName + ")"] : dataByKanton[d.properties.KantonName_fr +" (" + d.properties.alternateName + ")"] ?
                            dataByKanton[d.properties.KantonName_fr +" (" + d.properties.alternateName + ")"] : dataByKanton[d.properties.KantonName_it +" (" + d.properties.alternateName + ")"];
  });

  showFullData(dataByKanton);


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

      // Remove previous text
      d3.select("#canton-info")
        .selectAll("p")
        .remove(); 

      // Highlight selected part
      d3.select(this) 
        .style("stroke", "while")
        .style("stroke-width", 2)
        .style("curser", "pointer"); // Last part doesn't work yet

      // Add Text info about selected part
      var arr = [d.properties.KantonName_de + " (" + d.properties.alternateName + ")" ,
                "Gesammtteilnehmer: " + d.properties.details.both,
                "Weibliche Teilnehmer: " + d.properties.details.female,
                "Männliche Teilnehmer: " + d.properties.details.male];

      d3.select("#canton-info")
        .append("p")
        .html(arr.join('<br/><br/>'));
    })

    // De-highlight once curser leaves by changing back the style of the Kanton
    .on("mouseout", function(d) {
      d3.select(this)
        .style("stroke", "white")
        .style("stroke-width", 0.5);   
      
      showFullData(dataByKanton);

    });
}

function showFullData(dataByKanton) {
 
  var arr = ["Alle Kantone",
    "Gesammtteilnehmer: " + dataByKanton["sum"].both,
    "Weibliche Teilnehmer: " + dataByKanton["sum"].female,
    "Männliche Teilnehmer: " + dataByKanton["sum"].male];

  // Remove previous text
  d3.select("#canton-info")
  .selectAll("p")
  .remove(); 

  d3.select("#canton-info")
    .append("p")
    .html(arr.join('<br/><br/>'));
}

function prepareData(data/*, select*/) {
  let dataByKanton = {};

  data.forEach(function (d) {
    var kanton = d["aes_canton"].includes("Basel") ? "beide Basel (BL/BS)" : d["aes_canton"];
    var gender = d["t0sex"];

    if (!dataByKanton[kanton]) {
      dataByKanton[kanton] = {
        both: 0,
        female: 0,
        male: 0
      };
    }

    if (!dataByKanton["sum"]) {
      dataByKanton["sum"] = {
        both: 0,
        female: 0,
        male: 0
      };
    }

    if (gender === "Female") {
      dataByKanton[kanton].female += 1;
      dataByKanton[kanton].both += 1;
      dataByKanton["sum"].female += 1;

    } else if (gender === "Male") {
      dataByKanton[kanton].male += 1;
      dataByKanton[kanton].both += 1;
      dataByKanton["sum"].male += 1;
    }

    dataByKanton["sum"].both += 1;
  });
  return dataByKanton;
}
