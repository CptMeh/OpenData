
let varcheck = d3.select("#var-check");
const data = [
  ["t0sex", "Female", "Male"],
  ["t0immig", "Native (at least 1 parent born in Switzerland)", "Second generation (respondent born in Switzerland, no parent born in Switzerland)", "First generation (respondent and parent(s) born abroad)"],
  ["t0fmedu_comp", "Compulsory schooling only", "Upper secondary education", "Tertiary education"],
  ["aes_langreg", "German", "French", "Italian"],
  ["t0hisei08_3q", "Low", "Medium", "High"],
  ["t0wlem_3q", "Low", "Medium", "High"],
  ["t0st_nprog_req3", "High requirements", "Advanced requirements & Alternative/non-assignable study programme", "Basic/low requirements"],
  ["t1educ_class_1_r", "NET", "Internship", "10th school year", "Other intermediate solution", "2 years VET", "3-4 years VET", "Vocational baccalaureate //VET", "General baccalaureate", "Other general education programme (specialized middle school, Waldorf)"],
  ["t2educ_class_1_r", "NET", "Internship", "10th school year", "Other intermediate solution", "2 years VET", "3-4 years VET", "Vocational baccalaureate //VET", "General baccalaureate", "Other general education programme (specialized middle school, Waldorf)"],
  ["t3educ_class_1_r", "NET", "Internship", "10th school year", "Other intermediate solution", "2 years VET", "3-4 years VET", "Vocational baccalaureate //VET", "General baccalaureate", "Other general education programme (specialized middle school, Waldorf)"]
];

function addChecks(labels) {
    let div, list, check;

    for (let i = 0; i < labels.length; i++) {
        div = varcheck.append("div")
                        .attr("class", "form-check ")
                        .html("<p><b>"+labels[i]["name"]+"</b></p>");

        for (let j = 1; j < data[i].length; j++) {
            list = div.append("div")
                            .attr("class", "form-check")

            check = list.append("input")
                        .attr("type","radio")
                        .attr("class", "form-check-input")
                        .attr("name", "radio-group")
                        .attr("value", data[i][j])
                        .attr("id", data[i][j])
                        .on("change", function() {
                            if (this.checked) {
                                setSelected(data[i][0], this.value);
                            }
                            colorMap();
                            console.log(data[i][0] + ", " + this.value)
                        });
            

            list.append("label")
            .attr("for", labels[i]["label"])
            .html("<p>"+data[i][j]+"</p>");
        }
    }
}

function addDropDowns() {

}
