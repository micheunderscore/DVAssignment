// LINE CHART ==============================================================================

d3.csv("./src/revenueData.csv", function (datasetLineChart) {
  function datasetLineChartChosen(group) {
    var ds = [];
    for (x in datasetLineChart) {
      if (datasetLineChart[x].group == group) {
        ds.push(datasetLineChart[x]);
      }
    }
    return ds;
  }

  function dsLineChartBasics() {
    var margin = { top: 20, right: 10, bottom: 0, left: 50 },
      width = 500 - margin.left - margin.right,
      height = 150 - margin.top - margin.bottom;
    return {
      margin: margin,
      width: width,
      height: height,
    };
  }

  function dsLineChart() {
    var firstDatasetLineChart = datasetLineChartChosen(group);

    var basics = dsLineChartBasics();

    var margin = basics.margin,
      width = basics.width,
      height = basics.height;

    var xScale = d3.scale
      .linear()
      .domain([0, firstDatasetLineChart.length - 1])
      .range([0, width]);

    var yScale = d3.scale
      .linear()
      .domain([
        0,
        d3.max(firstDatasetLineChart, function (d) {
          return d.performance;
        }),
      ])
      .range([height, 0]);

    var line = d3.svg
      .line()
      .x(function (d, i) {
        return xScale(i);
      })
      .y(function (d) {
        return yScale(d.performance);
      });

    var svg = d3
      .select("#lineChart")
      .append("svg")
      .datum(firstDatasetLineChart)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
    // create group and move it so that margins are respected (space for axis and title)

    svg
      .append("circle")
      .attr("cx", 10)
      .attr("cy", 130)
      .attr("r", 6)
      .style("fill", "green");
    svg
      .append("circle")
      .attr("cx", 160)
      .attr("cy", 130)
      .attr("r", 6)
      .style("fill", "red");
    svg
      .append("text")
      .attr("x", 20)
      .attr("y", 130)
      .text("Max Performance")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");
    svg
      .append("text")
      .attr("x", 170)
      .attr("y", 130)
      .text("Min Performance")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");
    var plot = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("id", "lineChartPlot");
    /* descriptive titles as part of plot -- start */
    var dsLength = firstDatasetLineChart.length;

    plot
      .append("text")
      .text(firstDatasetLineChart[dsLength - 1].performance)
      .attr("id", "lineChartTitle2")
      .attr("x", width / 2)
      .attr("y", height / 2);
    /* descriptive titles -- end */

    plot
      .append("path")
      .attr("class", "line")
      .attr("d", line)
      // add color
      .attr("stroke", "lightgrey");

    plot
      .selectAll(".dot")
      .data(firstDatasetLineChart)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("fill", function (d) {
        return d.performance ==
          d3.min(firstDatasetLineChart, function (d) {
            return d.performance;
          })
          ? "red"
          : d.performance ==
            d3.max(firstDatasetLineChart, function (d) {
              return d.performance;
            })
          ? "green"
          : "white";
      })
      .attr("cx", line.x())
      .attr("cy", line.y())
      .attr("r", 3.5)
      .attr("stroke", "lightgrey")
      .append("title")
      .text(function (d) {
        return d.category + ": " + formatAsInteger(d.performance);
      });

    svg
      .append("text")
      .text("Overall Performance 2022")
      .attr("id", "lineChartTitle1")
      .attr("class", "titleText")
      .attr("x", margin.left + (width + margin.right) / 2)
      .attr("y", 10);
  }

  dsLineChart();

  /* ** UPDATE CHART ** */

  /* updates bar chart on request */
  window.updateLineChart = function (group, colorChosen) {
    var currentDatasetLineChart = datasetLineChartChosen(group);

    var { margin, width, height } = dsLineChartBasics();

    var xScale = d3.scale
      .linear()
      .domain([0, currentDatasetLineChart.length - 1])
      .range([0, width]);

    var yScale = d3.scale
      .linear()
      .domain([
        0,
        d3.max(currentDatasetLineChart, function (d) {
          return d.performance;
        }),
      ])
      .range([height, 0]);

    var line = d3.svg
      .line()
      .x(function (d, i) {
        return xScale(i);
      })
      .y(function (d) {
        return yScale(d.performance);
      });

    var svg = d3.select("#lineChart svg");

    var plot = d3.select("#lineChart").datum(currentDatasetLineChart);
    var dsLength = currentDatasetLineChart.length;

    plot
      .select("#lineChartTitle2")
      .text(currentDatasetLineChart[dsLength - 1].performance);

    plot
      .select("path")
      .transition()
      .duration(750)
      .attr("class", "line")
      .attr("d", line)
      .style("stroke", colorChosen);

    var path = plot
      .selectAll(".dot")
      .data(currentDatasetLineChart)
      .transition()
      .duration(750)
      .attr("class", "dot")
      .attr("fill", function (d) {
        return d.performance ==
          d3.min(currentDatasetLineChart, function (d) {
            return d.performance;
          })
          ? "red"
          : d.performance ==
            d3.max(currentDatasetLineChart, function (d) {
              return d.performance;
            })
          ? "green"
          : "white";
      })
      .attr("cx", line.x())
      .attr("cy", line.y())
      .attr("r", 3.5)
      .style("stroke", colorChosen);

    path.selectAll("title").text(function (d) {
      return d.category + ": " + formatAsInteger(d.performance);
    });

    svg
      .selectAll("text.titleText")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .text(group + "'s Performance 2022");
  };
});
