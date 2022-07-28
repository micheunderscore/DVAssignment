var margin = { top: 20, right: 20, bottom: 20, left: 20 },
  width =
    document.getElementById("teamChart").parentElement.clientWidth -
    margin.left -
    margin.right,
  height = 500 - margin.top - margin.bottom,
  horizontal = margin.top + width + margin.right,
  vertical = margin.top + height + margin.bottom,
  innerRadius = 180,
  outerRadius = Math.min(width, height) / 2,
  occurence = 100;

d3.csv("./src/data/status.csv", function (statusLookup) {
  d3.csv("./src/data/races.csv", function (raceLookup) {
    d3.csv("./src/data/results.csv", function (dataset) {
      function datasetChartChosen(usedGroup) {
        let outData = {};

        switch (usedGroup) {
          case "All":
            outData = dataset;
            break;
          default:
            outData = d3
              .nest()
              .entries(dataset)
              .filter((d) => d.driverId == usedGroup);

            break;
        }

        return d3
          .nest()
          .key((d) => d.statusId)
          .rollup((leaves) => d3.sum(leaves, () => 1))
          .entries(outData)
          .filter(
            (d) =>
              d.value > (usedGroup == "All" ? occurence : 0) &&
              (d.key != 1 || usedGroup != "All")
          );
      }

      function dsTeamChart(usedGroup, colorChosen) {
        let groupedData = datasetChartChosen(usedGroup);
        let filteredStatusLookup = statusLookup.filter((d) =>
          Object.values(groupedData)
            .map(({ key }) => key)
            .includes(d.statusId)
        );

        //Step 3: Drawing graph with SVG
        var svg = d3
          .select("#teamChart")
          .append("svg")
          .attr("id", "thisTeamChart")
          .attr("width", horizontal)
          .attr("height", vertical)
          .append("g")
          .attr(
            "transform",
            "translate(" +
              (width / 2 + margin.left) +
              "," +
              (height / 2 + margin.top) +
              ")"
          );

        //Step 5: Add X axis

        var x = d3
          .scaleBand()
          .range([0, 2 * Math.PI])
          .domain(filteredStatusLookup.map((d) => d.statusId)); // The domain of the X axis is the list of states.
        var y = d3
          .scaleRadial()
          .range([innerRadius, outerRadius]) // Domain will be define later.
          .domain([-100, d3.max(groupedData, (d) => +d.value)]); // Domain of Y is from 0 to the max seen in the data
        // Add the bars
        svg
          .append("g")
          .selectAll("path")
          .data(groupedData)
          .enter()
          .append("path")
          .attr("fill", colorChosen)
          .attr(
            "d",
            d3
              .arc() // imagine your doing a part of a donut plot
              .innerRadius(innerRadius)
              .outerRadius((d) => y(d.value))
              .startAngle((d) => x(d.key))
              .endAngle((d) => x(d.key) + x.bandwidth())
              .padAngle(0.01)
              .padRadius(innerRadius)
          );

        // Add the labels
        svg
          .append("g")
          .selectAll("g")
          .data(groupedData)
          .enter()
          .append("g")
          .attr("text-anchor", (d) =>
            (x(d.key) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI
              ? "start"
              : "end"
          )
          .attr(
            "transform",
            (d) =>
              `rotate(${
                ((x(d.key) + x.bandwidth() / 2) * 180) / Math.PI - 90
              })translate(${innerRadius - 5} ,0)`
          )
          .append("text")
          .text((d) => `${statusLookup[d.key - 1]?.status} (${d.value})`)
          .attr("transform", (d) =>
            (x(d.key) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI
              ? "rotate(180)"
              : "rotate(0)"
          )
          .style("font-size", "11px")
          .attr("alignment-baseline", "middle");

        //Labelling Main Title
        svg
          .append("text")
          .text(
            `${usedGroup == "All" ? "" : "Career Overall "}Race Finish Status${
              usedGroup == "All" ? ` With >${occurence} Occurences` : ""
            }`
          )
          .attr("id", "chartTitle1")
          .attr("class", "titleText")
          .attr("text-anchor", "middle")
          .attr("y", -vertical / 2.2);
      }

      window.updateTeamChart = function (usedGroup, colorChosen) {
        d3.selectAll("#thisTeamChart").remove();
        dsTeamChart(usedGroup, colorChosen);
      };

      updateTeamChart("All", "lightcoral");
    });
  });
});
