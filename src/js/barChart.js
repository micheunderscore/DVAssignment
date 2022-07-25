var group = "All";

d3.csv("./src/data/drivers.csv", function (driverLookup) {
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

    function stackedARChart(usedGroup, usedColor) {
      var groupedData = datasetSARChartChosen(usedGroup);
    }

    window.updateStackedARChart = function (usedGroup, colorChosen) {
      d3.selectAll("#thisSARChart").remove();
      stackedARChart(usedGroup, colorChosen);
    };

    updateLineChart(group, "lightcoral");
  });
});
