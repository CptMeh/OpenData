
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

function addDropDownChecks(labels) {
    let dropdown, dropdownToggle, dropdownMenu, radio;
  
    for (let i = 0; i < labels.length; i++) {
        dropdown = varcheck.append("div")
            .attr("class", "dropdown");
    
        dropdownToggle = dropdown.append("button")
            .attr("class", "btn btn-secondary dropdown-toggle")
            .attr("type", "button")
            .attr("id", labels[i]["label"] + "-dropdown")
            .attr("data-bs-toggle", "dropdown")
            .attr("aria-haspopup", "true")
            .attr("aria-expanded", "false")
            .text(labels[i]["name"]);
    
        dropdownMenu = dropdown.append("div")
            .attr("class", "dropdown-menu")
            .attr("aria-labelledby", labels[i]["label"] + "-dropdown");
    
        for (let j = 1; j < data[i].length; j++) {
            radio = dropdownMenu.append("div")
            .attr("class", "form-check");
    
            radio.append("input")
            .attr("type", "radio")
            .attr("class", "form-check-input")
            .attr("name", "radio-group-" + i)
            .attr("value", data[i][j])
            .attr("id", data[i][j])
            .on("change", function() {
                if (this.checked) {
                setSelected(data[i][0], this.value);
                }
                colorMap();
                console.log(data[i][0] + ", " + this.value);
            });
    
            radio.append("label")
            .attr("class", "form-check-label")
            .attr("for", data[i][j])
            .text(data[i][j]);
        }
    }
}

function addButtonChecks2(labels) {
    const buttons = varcheck2.append("div");
    const radioBox = varcheck2.append("div")
      .attr("id", "radio-box")
      .attr("class", "card p-4 mb-3");

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

    setRadios(data[0], radioBox);
  }
  
function addButtonChecks(labels) {
    const buttons = varcheck.append("div");
    const radioBox = varcheck.append("div")
      .attr("id", "radio-box")
      .attr("class", "card p-4 mb-3");
  
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
  
