/*
Suggestions:
1. Assign a unique id/class for best/worst pins on line chart. And then just retrieve from dom and get array length for the count. 
*/

// LINE CHART ==============================================================================
var group = "All";
var maxPos = 30;
d3.csv("./src/data/races.csv", (raceLookup) => {
  d3.csv("./src/data/drivers.csv", (driverLookup) => {
    d3.csv("./src/data/results.csv", function (dataset) {
      function datasetLineChartChosen(usedGroup) {
        let outData = {};
        switch (usedGroup) {
          case "All":
            var ref = d3
              .nest()
              .key((d) => d.driverId)
              .rollup((leaves) => d3.sum(leaves, (d) => d.points))
              .entries(dataset)
              .sort((a, b) => d3.descending(a.value, b.value));
            ref = ref.slice(0, 30);

            outData = d3
              .nest()
              .key((d) => d.driverId)
              .rollup((leaves) => d3.mean(leaves, (d) => d.positionOrder))
              .entries(dataset)
              .filter((d) => ref.some((f) => d.key == f.key))
              .sort((a, b) => {
                var refKeys = ref.reduce((i, j) => {
                  i.push(j["key"]);
                  return i;
                }, []);
                return refKeys.indexOf(a.key) - refKeys.indexOf(b.key);
              });
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
        let isAll = usedGroup == "All";
        let groupedData = datasetLineChartChosen(usedGroup);
        let bestPos = Math.floor(d3.min(groupedData, (d) => d.value));
        let worstPos = Math.floor(d3.max(groupedData, (d) => d.value));

        let margin = { top: 50, right: 20, bottom: 50, left: 20 },
          width =
            (document.getElementById("lineChart").parentElement.clientWidth -
              margin.right -
              margin.left) *
            0.95,
          height = 300 - margin.top - margin.bottom;

        let x = d3
          .scaleLinear()
          .domain([0, groupedData.length - 1])
          .range(isAll ? [width, 0] : [0, width]);

        let y = d3
          .scaleLinear()
          .domain(isAll ? [4, 15] : [0, maxPos])
          .range([0, height]);

        let line = d3
          .line()
          .x((d, i) => x(i))
          .y((d) => {
            return y(d.value);
          });

        let svg = d3
          .select("#lineChart")
          .append("svg")
          .attr("id", "thisLineChart")
          .datum(groupedData)
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom);

        let plot = svg
          .append("g")
          .attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")"
          )
          .attr("id", "lineChartPlot");

        // Create the circle that travels along the curve of chart
        let focus = svg
          .append("g")
          .append("circle")
          .style("fill", "none")
          .attr("stroke", "black")
          .attr("r", 5)
          .style("opacity", 0);

        // Create the text that travels along the curve of chart
        let focusText1 = svg
          .append("text")
          .attr("x", width)
          .attr("y", margin.top + height + 20)
          .attr("text-anchor", "end")
          .style("opacity", 0)
          .style("text-align", "left");

        let focusText2 = svg
          .append("text")
          .attr("x", width)
          .attr("y", margin.top + height)
          .attr("text-anchor", "end")
          .style("opacity", 0)
          .style("text-align", "left");

        // Create a rect on top of the svg area: this rectangle recovers mouse position
        svg
          .append("rect")
          .attr("x", margin.left)
          .attr("y", margin.top)
          .attr("width", width + (isAll ? margin.right : 0))
          .attr("height", height)
          .attr("opacity", 1)
          .style("fill", "none")
          .style("pointer-events", "all")
          .on("mouseover", mouseover)
          .on("mousemove", mousemove)
          .on("mouseout", mouseout);

        // What happens when the mouse move -> show the annotations at the right positions.
        function mouseover() {
          focus.style("opacity", 1);
          focusText1.style("opacity", 1);
          focusText2.style("opacity", 1);
        }

        function mousemove() {
          let i = Math.ceil(x.invert(d3.mouse(this)[0] - margin.left));
          if (i < 0) return;
          let selectedData = groupedData[i];
          let result = dataset.filter(
            (obj) => obj.resultId == selectedData?.key
          )[0];
          let race = raceLookup.filter(
            (obj) => obj?.raceId == result?.raceId
          )[0];

          let driver = driverLookup[selectedData?.key - 1];
          focus
            .attr("cx", x(i) + margin.left)
            .attr("cy", y(selectedData?.value) + margin.top);
          focusText2.text(
            `${
              isAll
                ? `${driver.forename} ${driver.surname}`
                : `${race?.year} ${race?.name}`
            }`
          );
          focusText1.text(
            `${isAll ? "Driver" : "Race"} #${i + 1}${
              isAll ? " Average " : " "
            }Position: ${Math.floor(selectedData.value)}`
          );
        }
        function mouseout() {
          focus.style("opacity", 0);
          focusText1.style("opacity", 0);
          focusText2.style("opacity", 0);
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
            d.value == d3.min(groupedData, (d) => d.value) ||
            d.value == d3.max(groupedData, (d) => d.value)
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
              isAll
                ? "Overall Driver"
                : `${driverLookup[usedGroup - 1].forename} ${
                    driverLookup[usedGroup - 1].surname
                  }'s`
            } Career Average Grid Position`
          )
          .attr("id", "chartTitle1")
          .attr("class", "titleText")
          .attr("x", (margin.left + width + margin.right) / 2)
          .attr("y", margin.top - 10);

        plot
          .append("text")
          .text(Math.floor(d3.mean(groupedData, (d) => d.value)))
          .attr("id", "chartTitle2")
          .attr("x", width / 2)
          .attr("y", height / 2);

        let worstCount = 0;
        let bestCount = 0;
        groupedData.forEach((d) => {
          switch (Math.floor(d.value)) {
            case worstPos:
              worstCount++;
              break;
            case bestPos:
              bestCount++;
              break;
            default:
              break;
          }
        });

        svg
          .append("text")
          .attr("x", margin.left + 20)
          .attr("y", margin.top + height)
          .text(
            `Best ${
              isAll ? "Average" : ""
            } Grid Position #${bestPos} (${bestCount}x)`
          )
          .style("font-size", "15px")
          .attr("alignment-baseline", "middle");

        svg
          .append("text")
          .attr("x", margin.left + 20)
          .attr("y", margin.top + height + 20)
          .text(
            `Worst ${
              isAll ? "Average" : ""
            } Grid Position #${worstPos} (${worstCount}x)`
          )
          .style("font-size", "15px")
          .attr("alignment-baseline", "middle");

        svg
          .append("circle")
          .attr("cx", margin.left + 10)
          .attr("cy", margin.top + height)
          .attr("r", 6)
          .style("fill", "green");

        svg
          .append("circle")
          .attr("cx", margin.left + 10)
          .attr("cy", margin.top + height + 20)
          .attr("r", 6)
          .style("fill", "red");
      }

      /* ** UPDATE CHART ** */
      window.updateLineChart = function (usedGroup, colorChosen) {
        d3.selectAll("#thisLineChart").remove();
        dsLineChart(usedGroup, colorChosen);
      };

      updateLineChart(group, "lightcoral");
    });
  });
});
