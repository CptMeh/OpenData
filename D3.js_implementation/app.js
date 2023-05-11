// Make this dynamic!
const width = 750;
const height = 600;

const svg = d3.select("#map")
              .append("svg")
              .attr("width", width)
              .attr("height", height)
              //.style("curser", "move")
              //.attr("preserveAspectRatio", "xMinYMax")
              .attr("class", "map");

d3.queue()
  .defer(d3.json, "https://data.geo.admin.ch/ch.bafu.landesforstinventar-kantone/landesforstinventar-kantone/landesforstinventar-kantone_2056.geojson")
  //.defer(d3.csv, "/Daten/TREE2_Data_IWI_Open_Data_Vorlesung_2023_label.csv")
  .await(function (error, map/*, data*/) {
      if (error) {
        console.error("Somthing went wrong: " + error);
      } else {
        drawMap(map/*, data*/);
      }
  });

  
function drawMap(map, data) {

  const projection = d3.geoIdentity().fitSize([width, height], map);
  const path = d3.geoPath().projection(projection);

  svg.selectAll("path")
    .data(map.features)
    .enter()
    .append("path")
    .attr("name", function(d) {
      return d.properties.name;
    })
    .attr("d", path)
    .style("fill", "grey")
    .style("stroke", "white")
    .style("stroke-width", 0.5)
    .on("mouseover", function(d) {

      //Remove previous text
      svg.selectAll(".externalObject").remove(); 


      // Highlight selected part
      d3.select(this) 
        .style("stroke", "while")
        .style("stroke-width", 2)
        .style("curser", "pointer"); 

      // Add Text info about selected part
      svg.append("foreignObject")
        .attr("class", "externalObject")
        .attr("x", 550 + "px")
        .attr("y", 0 + "px")
        .attr("width", 200)
        .attr("height", 100)
        .append("xhtml:div")
        .style("rotate", "180deg")
        .style("transform", "rotateY(180deg)")
        .html("<input type='text' id=new_x1 placeholder='" + d.properties.KantonName_de + " (" + d.properties.alternateName + ")" +"' onchange=update()></input>");
              //+ "<input type='text' id=new_x2 placeholder='" + DATEN.....);

    })

    // De-highlight once curser leaves
    .on("mouseout", function(d) {
      d3.select(this)
        .style("stroke", "white")
        .style("stroke-width", 0.5);      
    });
}