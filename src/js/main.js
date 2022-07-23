var formatAsPercentage = d3.format("%"),
  formatAsPercentage1Dec = d3.format(".1%"),
  formatAsInteger = d3.format(","),
  fsec = d3.time.format("%S s"),
  fmin = d3.time.format("%M m"),
  fhou = d3.time.format("%H h"),
  fwee = d3.time.format("%a"),
  fdat = d3.time.format("%d d"),
  fmon = d3.time.format("%b");

function dsPieChart() {
  var dataset = [
    { category: "Samad", measure: 0.3 },
    { category: "Phang", measure: 0.25 },
    { category: "Johan", measure: 0.15 },
    { category: "Rita", measure: 0.05 },
    { category: "Lenny", measure: 0.18 },
    { category: "Pian", measure: 0.04 },
    { category: "Siti", measure: 0.03 },
  ];

  var width = 400,
    height = 400,
    outerRadius = Math.min(width, height) / 2,
    innerRadius = outerRadius * 0.999,
    // for animation

    innerRadiusFinal = outerRadius * 0.5,
    innerRadiusFinal3 = outerRadius * 0.45,
    color = d3.scale.category20();

  var vis = d3
    .select("#pieChart")
    .append("svg:svg") //create the SVG element
    .data([dataset]) //associate data
    .attr("width", width) //set the width and height
    .attr("height", height)
    .append("svg:g") //make a group to the chart
    //move the center of the pie chart
    .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

  var arc = d3.svg
    .arc() // create <path> elements
    .outerRadius(outerRadius)
    .innerRadius(innerRadius);
  // for animation

  var arcFinal = d3.svg
    .arc()
    .innerRadius(innerRadiusFinal)
    .outerRadius(outerRadius);

  var arcFinal3 = d3.svg
    .arc()
    .innerRadius(innerRadiusFinal3)
    .outerRadius(outerRadius);

  var pie = d3.layout.pie().value(function (d) {
    return d.measure;
  });

  var arcs = vis
    .selectAll("g.slice")
    .data(pie) //associate the generated pie data
    .enter() //create <g> elements
    .append("svg:g") //create a group to hold each slice
    .attr("class", "slice") //set style in the slices
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)
    .on("click", up);

  arcs
    .append("svg:path")
    //set the color for each slice
    .attr("fill", function (d, i) {
      return color(i);
    })
    .attr("d", arc) // actual SVG path
    .append("svg:title") //mouseover title
    .text(function (d) {
      return d.data.category + ": " + formatAsPercentage(d.data.measure);
    });

  d3.selectAll("g.slice")
    .selectAll("path")
    .transition()
    .duration(750)
    .delay(10)
    .attr("d", arcFinal);

  // Add a label to the larger arcs, translated to the arc centroid
  arcs
    .filter(function (d) {
      return d.endAngle - d.startAngle > 0.1;
    })
    .append("svg:text")
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .attr("transform", function (d) {
      return "translate(" + arcFinal.centroid(d) + ")rotate(" + angle(d) + ")";
    })
    .text(function (d) {
      return formatAsPercentage(d.value);
    })

    .text(function (d) {
      return d.data.category;
    });

  // Computes the label angle of an arc, convert from rad to deg.
  function angle(d) {
    var a = ((d.startAngle + d.endAngle) * 90) / Math.PI - 90;
    return a > 90 ? a - 180 : a;
  }

  // Pie chart title
  vis
    .append("svg:text")
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .text("Revenue 2022")
    .attr("class", "title");

  function mouseover() {
    d3.select(this)
      .select("path")
      .transition()
      .duration(750)
      .attr("d", arcFinal3);
  }

  function mouseout() {
    d3.select(this)
      .select("path")
      .transition()
      .duration(750)
      .attr("d", arcFinal);
  }

  function up(d, i) {
    updateBarChart(d.data.category, color(i));
    updateLineChart(d.data.category, color(i));
  }
}

dsPieChart(); //execute
var group = "All";
