var margin = { top: 50, right: 40, bottom: 50, left: 40 },
  width =
    (document.getElementById("barChart").parentElement.clientWidth -
      margin.left -
      margin.right) *
    0.95,
  height = 400 - margin.top - margin.bottom;

//Step 4: Parse the data from local machine
d3.csv("./src/data/drivers.csv", function (driverLookup) {
  d3.csv("./src/data/results.csv", function (resultsLookup) {
    d3.csv("./src/data/races.csv", function (dataset) {
      function datasetChartChosen(usedGroup) {
        let outData = {};

        switch (usedGroup) {
          case "All":
            outData = dataset;
            break;
          default:
            let driverResults = d3
              .nest()
              .key((d) => d.driverId)
              .entries(resultsLookup)
              .filter(
                (d) =>
                  d.key == usedGroup &&
                  d.values.some(
                    (d) =>
                      d.positionOrder != undefined &&
                      !Number.isNaN(d.positionOrder)
                  )
              );

            outData = d3
              .nest()
              .entries(dataset)
              .filter((d) =>
                driverResults[0].values
                  .map(({ raceId, ...item }) => raceId)
                  .includes(d.raceId)
              );

            break;
        }

        return d3
          .nest()
          .key((d) => d.year)
          .rollup((leaves) => {
            var max = 0;
            leaves.map((d) => {
              if (+d.round > max) max = +d.round;
            });
            return max;
          })
          .entries(outData)
          .sort((a, b) => d3.ascending(a.key, b.key));
      }

      function dsBarChart(usedGroup, colorChosen) {
        var groupedData = datasetChartChosen(usedGroup);

        //Step 3: Drawing graph with SVG
        var svg = d3
          .select("#barChart")
          .append("svg")
          .attr("id", "thisBarChart")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")"
          );

        //Step 5: Add X axis
        var x = d3
          .scaleBand()
          .range([0, width])
          .domain([...groupedData.map((d) => d.key)])
          .padding(1);

        var xAxis = svg
          .append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(
            d3
              .axisBottom(x)
              .tickSize(-height)
              .tickFormat((interval, i) =>
                i % 2 !== 0 && usedGroup == "All" ? " " : interval
              )
          );
        xAxis.selectAll(".tick line").style("stroke-opacity", 0.5);
        xAxis
          .selectAll("text")
          .attr("transform", "translate(0,0)rotate(-45)")
          .style("text-anchor", "end");

        //Step 6: Add Y axis
        var y = d3.scaleLinear().domain([0, 30]).range([height, 0]);
        svg
          .append("g")
          .call(d3.axisLeft(y).tickSize(-width))
          .selectAll(".tick line")
          .style("stroke-opacity", 0.5);

        // Circles
        svg
          .selectAll("mycircle")
          .data(groupedData)
          .enter()
          .append("circle")
          .attr("cx", (d) => x(d.key))
          .attr("cy", (d) => y(d.value))
          .attr("r", "4")
          .style("fill", colorChosen)
          .attr("stroke", "black");

        //Labelling Main Title
        svg
          .append("text")
          .text("Rounds of Races Based on Year")
          .attr("id", "chartTitle1")
          .attr("class", "titleText")
          .attr("text-anchor", "middle")
          .attr("x", width / 2)
          .attr("y", -margin.top / 2);

        //labeling x axis
        svg
          .append("text")
          .attr("x", width + margin.left * 0.5)
          .attr("y", height + 5)
          .attr("text-anchor", "middle")
          .style("font-size", 12)
          .text("Year");

        //labeling y axis
        svg
          .append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate(-30," + height / 2 + " )rotate(-90)")
          .style("font-size", 12)
          .text("Rounds of Races");
      }

      window.updateBarChart = function (usedGroup, colorChosen) {
        d3.selectAll("#thisBarChart").remove();
        dsBarChart(usedGroup, colorChosen);
      };

      updateBarChart("All", "lightcoral");
    });
  });
});
