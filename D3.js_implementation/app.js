// Make this dynamic!
const width = 750;
const height = 600;

// Add an SVG to the div with the ID 'map' and then sets its height and width.
const svg = d3.select("#map")
              .append("svg")
              .attr("width", width)
              .attr("height", height)
              //.style("curser", "move")
              //.attr("preserveAspectRatio", "xMinYMax")
              ; 

// Get the map- and TREE-data and check if everything worked. Then use the drawMap function to render the map.
d3.queue()
  // This one is the Swiss-Map-Geo-Data
  .defer(d3.json, "https://data.geo.admin.ch/ch.bafu.landesforstinventar-kantone/landesforstinventar-kantone/landesforstinventar-kantone_2056.geojson")
  
  // This one is the TREE-Data
  //.defer(d3.csv, "/Daten/TREE2_Data_IWI_Open_Data_Vorlesung_2023_label.csv")

  // Wait till all the data is ready
  .await(function (error, map/*, data*/) {
      if (error) {
        console.error("Somthing went wrong: " + error);
      } else {
        drawMap(map/*, data*/);
      }
  });


/* Renders the map itself and (once we get it to work) can then add the TREE-Data to it. (not implemented ye ,:D)*/
function drawMap(map, data) {

  // The projection determines what kind of plane the map itself is projected on to (eg. onto a globe or a flat plain).
  const projection = d3.geoIdentity().fitSize([width, height], map);

  // Idk what dis doo yet :/ I think it renders the kantone?
  const path = d3.geoPath().projection(projection);

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
      svg.selectAll(".externalObject").remove(); 


      // Highlight selected part
      d3.select(this) 
        .style("stroke", "while")
        .style("stroke-width", 2)
        .style("curser", "pointer"); // Last part doesn't work yet

      // Add Text info about selected part
      svg.append("foreignObject")
        .attr("class", "externalObject")
        .attr("x", 550 + "px") // Placement of box
        .attr("y", 0 + "px")
        .attr("width", 200) // Size of box
        .attr("height", 100)
        .append("xhtml:div")
        .style("rotate", "180deg") // This is nessecary, because everything is upside down because the map is weird :/
        .style("transform", "rotateY(180deg)") // Ditto
        .html("<input type='text' id=new_x1 placeholder='" + d.properties.KantonName_de + " (" + d.properties.alternateName + ")" +"' onchange=update()></input>");
              //+ "<input type='text' id=new_x2 placeholder='" + DATEN.....);

    })

    // De-highlight once curser leaves by changing back the style of the Kanton
    .on("mouseout", function(d) {
      d3.select(this)
        .style("stroke", "white")
        .style("stroke-width", 0.5);      
    });
}