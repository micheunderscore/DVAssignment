// LINE CHART ==============================================================================
var group = "All";
d3.csv("./src/data/drivers.csv", (driverLookup) => {
  d3.csv("./src/data/results.csv", function (dataset) {
    function datasetLineChartChosen(usedGroup) {
      let outData = {};

      switch (usedGroup) {
        case "All":
          outData = d3
            .nest()
            .key((d) => d.driverId)
            .rollup((leaves) => d3.mean(leaves, (d) => d.positionOrder))
            .entries(dataset);
          break;
        default:
          let temp = d3
            .nest()
            .key((d) => d.driverId)
            .entries(dataset)
            .filter((d) => {
              return (
                d.key == usedGroup &&
                d.values.some(
                  (d) =>
                    d.positionOrder != undefined &&
                    !Number.isNaN(d.positionOrder)
                )
              );
            })[0].values;
          outData = d3
            .nest()
            .key((d) => d.resultId)
            .rollup((leaves) => d3.sum(leaves, (d) => d.positionOrder))
            .entries(temp);
          break;
      }

      return outData;
    }

    function dsLineChart(usedGroup, usedColor) {
      let groupedData = datasetLineChartChosen(usedGroup);

      var margin = { top: 50, right: 0, bottom: 50, left: 0 },
        width = 800 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

      var x = d3
        .scaleLinear()
        .domain([0, groupedData.length - 1])
        .range([0, width]);

      var y = d3.scaleLinear().domain([0, 50]).range([0, height]);

      var line = d3
        .line()
        .x((d, i) => x(i))
        .y((d) => {
          return y(d.value);
        });

      var svg = d3
        .select("#lineChart")
        .append("svg")
        .attr("id", "thisLineChart")
        .datum(groupedData)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

      var plot = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("id", "lineChartPlot");

      plot
        .append("path")
        .attr("class", "line")
        .attr("d", line)
        .style("stroke", usedColor);

      plot
        .selectAll(".dot")
        .data(groupedData)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("fill", (d) =>
          d.value == d3.max(groupedData, (d) => d.value)
            ? "red"
            : d.value == d3.min(groupedData, (d) => d.value)
            ? "green"
            : "white"
        )
        .attr("opacity", (d) =>
          d.value == d3.min(groupedData, (d) => d.value) ||
          d.value == d3.max(groupedData, (d) => d.value)
            ? 1
            : 0
        )
        .attr("cx", line.x())
        .attr("cy", line.y())
        .attr("r", 3.5)
        .attr("stroke", "lightgrey");

      svg
        .append("text")
        .text(
          `${
            usedGroup == "All"
              ? "Overall Driver"
              : `${driverLookup[usedGroup - 1].forename} ${
                  driverLookup[usedGroup - 1].surname
                }'s`
          } Career Average Grid Position`
        )
        .attr("id", "lineChartTitle1")
        .attr("class", "titleText")
        .attr("x", (margin.left + width + margin.right) / 2)
        .attr("y", margin.top / 2);

      plot
        .append("text")
        .text(d3.mean(groupedData, (d) => d.value).toFixed(0))
        .attr("id", "lineChartTitle2")
        .attr("x", width / 2)
        .attr("y", height / 2);

      svg
        .append("circle")
        .attr("cx", margin.left + 10)
        .attr("cy", margin.top + height)
        .attr("r", 6)
        .style("fill", "green");
      svg
        .append("circle")
        .attr("cx", margin.left + 180)
        .attr("cy", margin.top + height)
        .attr("r", 6)
        .style("fill", "red");
      svg
        .append("text")
        .attr("x", margin.left + 20)
        .attr("y", margin.top + height)
        .text(
          `Best Grid Position #${d3
            .min(groupedData, (d) => d.value)
            .toFixed(0)}`
        )
        .style("font-size", "15px")
        .attr("alignment-baseline", "middle");
      svg
        .append("text")
        .attr("x", margin.left + 190)
        .attr("y", margin.top + height)
        .text(
          `Worst Grid Position #${d3
            .max(groupedData, (d) => d.value)
            .toFixed(0)}`
        )
        .style("font-size", "15px")
        .attr("alignment-baseline", "middle");
    }

    /* ** UPDATE CHART ** */
    window.updateLineChart = function (usedGroup, colorChosen) {
      d3.selectAll("#thisLineChart").remove();
      dsLineChart(usedGroup, colorChosen);
    };

    updateLineChart(group, "lightred");
  });
});
