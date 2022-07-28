var margin = { top: 30, right: 30, bottom: 30, left: 60 },
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
            outData = d3
              .nest()
              .key((d) => d.raceId)
              .entries(dataset);
            break;
          default:
            let driverResults = d3
              .nest()
              .key((d) => d.driverId)
              .entries(resultsLookup)
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
            outData = driverResults;
            // outData = d3
            //   .nest()
            //   .key((d) => d.resultId)
            //   .rollup((leaves) => d3.sum(leaves, (d) => d.positionOrder))
            //   .entries(temp);
            break;
        }

        return outData;
      }

      function dsBarChart(usedGroup, colorChosen) {
        // console.log(datasetChartChosen(usedGroup));
        var groupedData = dataset;

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
          .domain(groupedData.map((d) => d.year))
          .padding(0.2);

        svg
          .append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x))
          .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");

        //Step 6: Add Y axis
        var y = d3.scaleLinear().domain([0, 30]).range([height, 0]);
        svg.append("g").call(d3.axisLeft(y));

        //Step 7: Add bars and close the scripts
        svg
          .selectAll("mybar")
          .data(groupedData)
          .enter()
          .append("rect")
          .attr("x", (d) => x(d.year))
          .attr("y", (d) => y(d.round))
          .attr("width", x.bandwidth())
          .attr("height", (d) => height - y(d.round))
          .attr("fill", " #0D1D74");

        //Labelling Main Title
        var title = svg
          .append("text")
          .text("Rounds of races based on year")
          .attr("id", "chartTitle1")
          .attr("class", "titleText")
          .attr("text-anchor", "middle")
          .attr("dy", margin.top / 2)
          .attr("dx", width / 2);

        //labeling x axis
        svg
          .append("text")
          .attr("x", width / 1)
          .attr("y", height + 30)
          .attr("text-anchor", "middle")
          .style("font-family ", "Verdana")
          .style("font-size", 12)
          .text("Year");

        //labeling y axis
        svg
          .append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "translate(-30," + height / 2 + " )rotate(-90)")
          .style("font-family ", "Verdana")
          .style("font-size", 12)
          .text("Rounds of races");
      }

      window.updateBarChart = function (usedGroup, colorChosen) {
        d3.selectAll("#thisBarChart").remove();
        dsBarChart(usedGroup, colorChosen);
      };

      updateBarChart(1, "lightcoral");
    });
  });
});
