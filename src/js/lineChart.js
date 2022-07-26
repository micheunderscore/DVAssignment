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

      var margin = { top: 100, right: 0, bottom: 50, left: 0 },
        width = window.innerWidth - 500,
        height = 200;

      console.log();

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
        .attr(
          "transform",
          "translate(" + margin.left + "," + (margin.top + height) / 3 + ")"
        )
        .attr("id", "lineChartPlot");

      // Create the circle that travels along the curve of chart
      var focus = svg
        .append("g")
        .append("circle")
        .style("fill", "none")
        .attr("stroke", "black")
        .attr("r", 5)
        .style("opacity", 0);

      // Create the text that travels along the curve of chart
      var focusText = svg
        .append("text")
        .attr("x", margin.left + width - 200)
        .attr("y", margin.top + height)
        .style("opacity", 0)
        .attr("text-anchor", "right")
        .attr("alignment-baseline", "middle");

      // Create a rect on top of the svg area: this rectangle recovers mouse position
      svg
        .append("rect")
        .attr("y", margin.top)
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);

      // What happens when the mouse move -> show the annotations at the right positions.
      function mouseover() {
        focus.style("opacity", 1);
        focusText.style("opacity", 1);
      }

      function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]);
        var i = Math.floor(x0);
        var selectedData = groupedData[i];
        focus.attr("cx", x(i)).attr("cy", y(selectedData.value) + margin.top);
        focusText.text(
          "Race #" + i + "  -  " + "Position: " + Math.floor(selectedData.value)
        );
      }
      function mouseout() {
        focus.style("opacity", 0);
        focusText.style("opacity", 0);
      }

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
          (d.value == d3.min(groupedData, (d) => d.value) ||
            d.value == d3.max(groupedData, (d) => d.value)) &&
          usedGroup != "All"
            ? 1
            : 0
        )
        .attr("cx", line.x())
        .attr("cy", line.y())
        .attr("r", 3.5);

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
        .attr("id", "chartTitle1")
        .attr("class", "titleText")
        .attr("x", (margin.left + width + margin.right) / 2)
        .attr("y", margin.top / 2);

      plot
        .append("text")
        .text(Math.floor(d3.mean(groupedData, (d) => d.value)))
        .attr("id", "chartTitle2")
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
        .attr("cx", margin.left + 200)
        .attr("cy", margin.top + height)
        .attr("r", 6)
        .style("fill", "red");
      svg
        .append("text")
        .attr("x", margin.left + 20)
        .attr("y", margin.top + height)
        .text(
          `Best Grid Position #${Math.floor(
            d3.min(groupedData, (d) => d.value)
          )}`
        )
        .style("font-size", "15px")
        .attr("alignment-baseline", "middle");
      svg
        .append("text")
        .attr("x", margin.left + 210)
        .attr("y", margin.top + height)
        .text(
          `Worst Grid Position #${Math.floor(
            d3.max(groupedData, (d) => d.value)
          )}`
        )
        .style("font-size", "15px")
        .attr("alignment-baseline", "middle");
    }

    /* ** UPDATE CHART ** */
    window.updateLineChart = function (usedGroup, colorChosen) {
      d3.selectAll("#thisLineChart").remove();
      dsLineChart(usedGroup, colorChosen);
    };

    updateLineChart(group, "lightcoral");
  });
});
