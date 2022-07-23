d3.csv("./src/revenueData.csv", function (datasetBarChart) {
  function datasetBarChosen(group) {
    var ds = [];
    for (x in datasetBarChart) {
      if (datasetBarChart[x].group == group) {
        ds.push(datasetBarChart[x]);
      }
    }
    return ds;
  }

  function dsBarChartBasics() {
    var margin = { top: 30, right: 5, bottom: 20, left: 50 },
      width = 500 - margin.left - margin.right,
      height = 250 - margin.top - margin.bottom,
      colorBar = d3.scale.category20(),
      barPadding = 1;
    return {
      margin: margin,
      width: width,
      height: height,
      colorBar: colorBar,
      barPadding: barPadding,
    };
  }

  function dsBarChart() {
    var firstDatasetBarChart = datasetBarChosen(group);

    var { margin, width, height, barPadding } = dsBarChartBasics();

    var xScale = d3.scale
      .linear()
      .domain([0, firstDatasetBarChart.length])
      .range([0, width]);

    var yScale = d3.scale
      .linear()
      .domain([
        0,
        d3.max(firstDatasetBarChart, function (d) {
          return d.income;
        }),
      ])
      .range([height, 0]);

    //Create SVG element

    var svg = d3
      .select("#barChart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("id", "barChartPlot");

    var plot = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    plot
      .selectAll("rect")
      .data(firstDatasetBarChart)
      .enter()
      .append("rect")
      .attr("x", function (d, i) {
        return xScale(i);
      })
      .attr("width", width / firstDatasetBarChart.length - barPadding)
      .attr("y", function (d) {
        return yScale(d.income);
      })
      .attr("height", function (d) {
        return height - yScale(d.income);
      })
      .attr("fill", "steelblue");

    // Add y labels to plot

    plot
      .selectAll("text")
      .data(firstDatasetBarChart)
      .enter()
      .append("text")
      .text(function (d) {
        return formatAsInteger(d3.round(d.income));
      })
      .attr("text-anchor", "middle")
      .attr("x", function (d, i) {
        return (
          i * (width / firstDatasetBarChart.length) +
          (width / firstDatasetBarChart.length - barPadding) / 2
        );
      })
      .attr("y", function (d) {
        return yScale(d.income) + 14;
      })
      .attr("class", "yAxis");

    var xLabels = svg
      .append("g")
      .attr(
        "transform",
        "translate(" + margin.left + "," + (margin.top + height) + ")"
      );

    xLabels
      .selectAll("text.xAxis")
      .data(firstDatasetBarChart)
      .enter()
      .append("text")
      .text(function (d) {
        return d.category;
      })
      .attr("text-anchor", "middle")
      .attr("x", function (d, i) {
        return (
          i * (width / firstDatasetBarChart.length) +
          (width / firstDatasetBarChart.length - barPadding) / 2
        );
      })
      .attr("y", 15)
      .attr("class", "xAxis");

    // Title

    svg
      .append("text")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", 15)
      .attr("class", "title")
      .attr("text-anchor", "middle")
      .text("Overall Income Breakdown 2022");
  }

  dsBarChart();

  window.updateBarChart = function (group, colorChosen) {
    var currentDatasetBarChart = datasetBarChosen(group);

    var { margin, width, height, barPadding } = dsBarChartBasics();

    var xScale = d3.scale
      .linear()
      .domain([0, currentDatasetBarChart.length])
      .range([0, width]);

    var yScale = d3.scale
      .linear()
      .domain([
        0,
        d3.max(currentDatasetBarChart, function (d) {
          return d.income * 1;
        }),
      ])
      .range([height, 0]);
    var svg = d3.select("#barChart svg");

    var plot = d3.select("#barChartPlot").datum(currentDatasetBarChart);
    /* Note that here we only have to select the elements - no more appending! */
    plot
      .selectAll("rect")
      .data(currentDatasetBarChart)
      .transition()
      .duration(750)
      .attr("x", function (d, i) {
        return xScale(i);
      })
      .attr("width", width / currentDatasetBarChart.length - barPadding)
      .attr("y", function (d) {
        return yScale(d.income);
      })
      .attr("height", function (d) {
        return height - yScale(d.income);
      })
      .attr("fill", colorChosen);

    plot
      .selectAll("text.yAxis")
      .data(currentDatasetBarChart)
      .transition()
      .duration(750)
      .attr("text-anchor", "middle")
      .attr("x", function (d, i) {
        return (
          i * (width / currentDatasetBarChart.length) +
          (width / currentDatasetBarChart.length - barPadding) / 2
        );
      })
      .attr("y", function (d) {
        return yScale(d.income) + 14;
      })
      .text(function (d) {
        return formatAsInteger(d3.round(d.income));
      })
      .attr("class", "yAxis");

    svg
      .selectAll("text.title")
      .attr("x", (width + margin.left + margin.right) / 2)
      .attr("y", 15)
      .attr("class", "title")
      .attr("text-anchor", "middle")
      .text(group + "'s Income Breakdown 2022");
  };
});
