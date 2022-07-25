const colorPalette = [
  "#9819f2",
  "#baf279",
  "#79f2d4",
  "#1FCCF7",
  "#79f2a8",
  "#8bf279",
  "#798af2",
  "#DC0A3B",
  "#79f279",
  "#f29d79",
  "#79f2d4",
  "#dc79f2",
  "#f23981",
  "#79bff2",
  "#ae79f2",
  "#79dcf2",
  "#f2bf79",
  "#23326A",
  "#bff279",
  "#228988",
  "#f2ca79",
  "#D3ECCD",
  "#f27991",
  "#F14AFF",
  "#941728",
  "#33714C",
  "#4DFD80",
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

d3.csv("./src/data/drivers.csv", (driverLookup) => {
  d3.csv("./src/data/results.csv", function (dataset) {
    let groupedData = d3
      .nest()
      .key((d) => d.driverId)
      .rollup((leaves) => d3.sum(leaves, (d) => d.points))
      // .sort((d) => d.points)
      .entries(dataset);
    groupedData = groupedData.filter((d) => d.value > 0); // Only get drivers who have points
    groupedData = groupedData
      .sort((a, b) => d3.descending(a.value, b.value))
      .slice(0, 30); // Get top 30 drivers

    function dsPieChart(data) {
      var width = 450,
        height = 450,
        margin = 0;

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

      function mousemove(d) {
        var driver = driverLookup[d.data.value.key - 1];
        Tooltip.html(
          `${d.value}pts - ${driver.forename} ${driver.surname} (${driver.code})`
        )
          .style("border-color", colorPalette[d.data.value.key - 1])
          .style("left", d3.event.pageX + 10 + "px")
          .style("top", d3.event.pageY + 10 + "px");
      }

      function mouseleave(d) {
        Tooltip.style("opacity", 0);
        d3.select(this)
          .transition()
          .duration(500)
          .style("opacity", 0.5)
          .style("stroke-width", "0px");
      }

      function mouseover(d) {
        Tooltip.style("opacity", 1);
        d3.select(this)
          .transition()
          .duration(500)
          .style("opacity", 1)
          .style("stroke", "white")
          .style("stroke-width", "15px");
      }

      function up(d) {
        // updateBarChart(d.data.category, color(i));
        updateLineChart(d.data.value.key, colorPalette[d.data.value.key - 1]);
        group = d.data.value.key;

        d3.selectAll("allSlices").style("opacity", (data) =>
          group == data.data.value.key ? 1 : 0.5
        );
      }

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
        .attr("d", arc)
        .attr("fill", (d) => colorPalette[d.data.value.key - 1])
        .style("opacity", 0.6)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .on("click", up);

      // Pie chart title
      svg
        .append("text")
        .attr("text-anchor", "middle")
        .attr("y", -20)
        .text("Top 20")
        .attr("class", "title");

      // Pie chart title
      svg
        .append("text")
        .attr("text-anchor", "middle")
        .text("Formula One Drivers")
        .attr("class", "title");

      // Pie chart title
      svg
        .append("text")
        .attr("text-anchor", "middle")
        .attr("y", 20)
        .text("(by total career points)")
        .attr("class", "subtitle");
    }

    dsPieChart(groupedData);
  });
});
