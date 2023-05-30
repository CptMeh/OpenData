
let varcheck = d3.select("#var-check");
const weighted_data = [
    ["t1educ_class_1_r", "NET", "Internship", "10th school year", "Other intermediate solution", "2 years VET", "3-4 years VET", "Vocational baccalaureate //VET", "General baccalaureate", "Other general education programme (specialized middle school, Waldorf)"],
  ["t2educ_class_1_r", "NET", "Internship", "10th school year", "Other intermediate solution", "2 years VET", "3-4 years VET", "Vocational baccalaureate //VET", "General baccalaureate", "Other general education programme (specialized middle school, Waldorf)"],
  ["t3educ_class_1_r", "NET", "Internship", "10th school year", "Other intermediate solution", "2 years VET", "3-4 years VET", "Vocational baccalaureate //VET", "General baccalaureate", "Other general education programme (specialized middle school, Waldorf)"]]
const data = [
  ["t0sex", "Female", "Male"],
  ["t0immig", "Native (at least 1 parent born in Switzerland)", "Second generation (respondent born in Switzerland, no parent born in Switzerland)", "First generation (respondent and parent(s) born abroad)"],
  ["t0fmedu_comp", "Compulsory schooling only", "Upper secondary education", "Tertiary education"],
  ["aes_langreg", "German", "French", "Italian"],
  ["t0hisei08_3q", "Low", "Medium", "High"],
  ["t0wlem_3q", "Low", "Medium", "High"],
  ["t0st_nprog_req3", "High requirements", "Advanced requirements & Alternative/non-assignable study programme", "Basic/low requirements"]
];
  
function addButtonChecks(labels, weighted_labels) {
    const buttons = varcheck.append("div");
    const radioBox = varcheck.append("div")
      .attr("id", "radio-box")
      .attr("class", "card p-4 mb-3");

    const buttonItems2 = buttons.selectAll(".button-item")
      .data(weighted_labels)
      .enter()
      .append("div")
      .attr("class", "button-item");

    buttonItems2.append("button")
      .attr("id", d => d.label)
      .text(d => d.name)
      .on("click", (d, i) => {
        setRadios(weighted_data[i], radioBox);
      });

    buttons.append("br");

    buttons.append("h4")
        .text("Über die Teilnehmer:");
  
    const buttonItems = buttons.selectAll(".button-item")
      .data(labels)
      .enter()
      .append("div")
      .attr("class", "button-item");
  
    buttonItems.append("button")
      .attr("id", d => d.label)
      .text(d => d.name)
      .on("click", (d, i) => {
        setRadios(data[i], radioBox);
      });
  
    buttons.append("br");
    setRadios(weighted_data[0], radioBox);
    setRadios(data[0], radioBox);
  }
  

function setRadios(values, radioBox) {
    // Remove previous
    radioBox.selectAll(".radio-item").remove();
  
    // Add new ones
    const radio = radioBox.selectAll(".radio-item")
      .data(values.slice(1))
      .enter()
      .append("div")
      .attr("class", "radio-item");
  
    radio.append("input")
      .attr("type", "radio")
      .attr("class", "form-check-input")
      .attr("name", "radio-group")
      .attr("value", d => d)
      .attr("id", d => d)
      .on("change", function(d) {
        if (this.checked) {
          setSelected(values[0], d);
          colorMap();
        }
      });
  
    radio.append("label")
      .attr("for", d => d)
      .text(d => d);
  
    radioBox.select(".radio-item input").attr("checked", true);
    setSelected(values[0], values[1]);
    colorMap();
  }
  
