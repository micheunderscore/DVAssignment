// TODO: Update color selection
const colorPalette = [
  "#9819f2",
  "#7983f2",
  "#00b8b2",
  "#1FCCF7",
  "#79f2a8",
  "#02d4cd",
  "#798af2",
  "#DC0A3B",
  "#00A19C",
  "#f29d79",
  "#00A19C",
  "#dc79f2",
  "#f23981",
  "#79bff2",
  "#ae79f2",
  "#79dcf2",
  "#9796a1",
  "#23326A",
  "#bff279",
  "#228988",
  "#f2ca79",
  "#f08080",
  "#f27991",
  "#F14AFF",
  "#941728",
  "#33714C",
  "#E0610E",
  "#EFBD26",
  "#f279c2",
  "#ff2800",
  "#f29d79",
  "#d679f2",
  "#dc79f2",
  "#f23981",
  "#79bff2",
];

for (var i = 0; i < 10; i++) {
  colorPalette.push(...colorPalette);
}

var group = "All";
var cutoff = 30;
var blur = 0.5;

d3.csv("./src/data/drivers.csv", (driverLookup) => {
  d3.csv("./src/data/results.csv", function (dataset) {
    let groupedData = d3
      .nest()
      .key((d) => d.driverId)
      .rollup((leaves) => d3.sum(leaves, (d) => d.points))
      .entries(dataset)
      .sort((a, b) => d3.descending(a.value, b.value));
    groupedData = groupedData.filter((d) => d.value > 0); // Only get drivers who have points
    groupedData = groupedData.slice(0, cutoff); // Get top 30 drivers

    function dsPieChart(data) {
      var margin = 25,
        width =
          document.getElementById("pieChart").parentElement.clientWidth -
          margin,
        height = 450;

      var radius = Math.min(width, height) / 2 - margin;

      var Tooltip = d3
        .select("#pieChart")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2.5px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("position", "absolute");

      function mousemove(d, i) {
        var driver = driverLookup[d.data.value.key - 1];
        Tooltip.html(
          `#${d.index + 1} - (${d.value}pts) ${driver.forename} ${
            driver.surname
          } [${driver.code}]`
        )
          .style("font-family", "Verdana")
          // .style("border-color", colorPalette[i]) // TODO: Update color selection
          .style("border-color", colorPalette[d.data.value.key - 1])
          .style("left", d3.event.pageX + 10 + "px")
          .style("top", d3.event.pageY + 10 + "px");
      }

      function mouseleave(d) {
        Tooltip.style("opacity", 0);
        d3.select(this)
          .transition()
          .duration(250)
          .style("opacity", (data) => (group == data.data.value.key ? 1 : blur))
          .style("stroke-width", (data) =>
            group == data.data.value.key ? "5px" : "0px"
          );
      }

      function mouseover(d) {
        Tooltip.style("opacity", 1);
        d3.select(this)
          .transition()
          .duration(100)
          .style("opacity", 1)
          .style("stroke", "white")
          .style("stroke-width", "10px");
      }

      function up(d, i) {
        var currDriver = driverLookup[d.data.value.key - 1];
        // updateLineChart(d.data.value.key, colorPalette[i]); // TODO: Update color selection
        updateLineChart(d.data.value.key, colorPalette[d.data.value.key - 1]);
        updateBarChart(d.data.value.key, colorPalette[d.data.value.key - 1]);
        updateTeamChart(d.data.value.key, colorPalette[d.data.value.key - 1]);

        d3.selectAll("allSlices.path").style("opacity", blur);
        d3.selectAll("#selectedDriver")
          .text(
            `#${d.index + 1} - ${currDriver.forename} ${currDriver.surname}`
          )
          // .style("fill", colorPalette[i]); // TODO: Update color selection
          .style("fill", colorPalette[d.data.value.key - 1]);
        group = d.data.value.key;
        resetSlices();
      }

      function resetSlices() {
        d3.selectAll(".uhSlice")
          .transition()
          .duration(50)
          .style("opacity", (data) => (group == data.data.value.key ? 1 : blur))
          .style("stroke-width", (data) =>
            group == data.data.value.key ? "10px" : "0px"
          );
      }

      var resetGroups = function () {
        group = "All";
        resetSlices();
        updateLineChart(group, "lightcoral");
        updateBarChart(group, "lightcoral");
        updateTeamChart(group, "lightcoral");
        d3.selectAll("#selectedDriver")
          .text("Overall Drivers")
          .style("fill", "lightslategray");
      };

      var svg = d3
        .select("#pieChart")
        .append("svg")
        .data(data)
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      var pie = d3.pie().value((d) => {
        return d.value.value;
      })(d3.entries(data));

      var arc = d3
        .arc()
        .innerRadius(radius * 0.55)
        .outerRadius(radius * 1);

      svg
        .selectAll("allSlices")
        .data(pie)
        .enter()
        .append("path")
        .attr("class", "uhSlice")
        .attr("d", arc)
        // .attr("fill", (d, i) => colorPalette[i]) // TODO: Update color selection
        .attr("fill", (d) => colorPalette[d.data.value.key - 1])
        .style("opacity", blur)
        .style("stroke", "white")
        .style("stroke-width", "0px")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .on("click", up);

      // Pie chart title
      svg
        .append("text")
        .attr("text-anchor", "middle")
        .attr("y", -40)
        .text("Top " + cutoff)
        .attr("class", "title");

      // Pie chart title
      svg
        .append("text")
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .text("Formula One Drivers")
        .attr("class", "title");

      // Pie chart title
      svg
        .append("text")
        .attr("text-anchor", "middle")
        .text("(by total career points)")
        .attr("class", "subtitle");

      // Pie chart title
      svg
        .append("text")
        .attr("id", "selectedDriver")
        .attr("text-anchor", "middle")
        .attr("y", 40)
        .text("Overall Drivers")
        .attr("class", "subtitle")
        .style("font-weight", "bold");

      // Pie chart title
      svg
        .append("text")
        .attr("text-anchor", "middle")
        .attr("y", 60)
        .text("RESET GROUPS")
        .attr("class", "subtitle")
        .style("fill", "lightgrey")
        .on("mouseover", function () {
          d3.select(this).transition().duration(250).style("fill", "black");
        })
        .on("mouseleave", function () {
          d3.select(this).transition().duration(250).style("fill", "lightgrey");
        })
        .on("click", resetGroups);

      svg.append("button");
    }

    dsPieChart(groupedData);
  });
});
