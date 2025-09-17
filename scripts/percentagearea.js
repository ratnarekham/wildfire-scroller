// code is adapted from https://observablehq.com/@d3/multi-line-chart/2

(function () {
  d3.csv("data/wildfire_percentages_clean.csv", d3.autoType).then((data) => {
    data.forEach((d) => {
      d.year = +d.year;

      //for null values in csv
      Object.keys(d).forEach((key) => {
        if (key !== "year" && isNaN(d[key])) {
          d[key] = null;
        }
      });
    });

    wildfireData = data;
    updateChart();
  });

  const width = 800;
  const height = 600;
  const marginTop = 20;
  const marginRight = 30;
  const marginBottom = 30;
  const marginLeft = 80;

  function updateChart() {
    if (wildfireData.length === 0) return;

    // scales
    const x = d3
      .scaleLinear()
      .domain(d3.extent(wildfireData, (d) => d.year))
      .range([marginLeft, width - marginRight]);

    const y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(wildfireData, (d) => d3.max(Object.values(d).slice(1))),
      ])
      .range([height - marginBottom, marginTop]);

 
    const custom_colours = [
      "#0663c1ff",
      "#FF7F00",
      "#019201ff",
      "#df0808ff"
    ];

    const colour = d3
      .scaleOrdinal()
      .domain(Object.keys(wildfireData[0]).slice(1))
      .range(custom_colours);

    const chartContainer = d3.select("#percentagearea_chart");

    const svg = chartContainer
      .append("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr(
        "style",
        "width: 90%; max-width: 800px; height: auto; overflow: visible; font: 14px rem sans-serif; padding: 10px; color: black; background-color: #ffffff; align-items: center; margin-bottom: 0px;"
      );

    const chartGroup = svg.append("g");

    // Add the x axis
    var xAxisGroup = chartGroup
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .attr("font-size", 20)
      .call(
        d3
          .axisBottom(x)
          .ticks(width / 80)
          .tickSizeOuter(0)
          .tickFormat(d3.format("d"))
      )
      .call((g) => g.selectAll(".tick text").attr("font-size", "14px"));


    // Add the y axis
    var yAxisGroup = chartGroup
      .append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y))
      
      .call((g) =>
        g
          .append("text")
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", "black")
          .attr("text-anchor", "start")
          .text("% of Burnt Area")
          .attr("font-size", "14px")
      )
      .call((g) => g.selectAll(".tick text").attr("font-size", "14px"));


  //grouping data by country

    const countries = Object.keys(wildfireData[0]).slice(1);
  
    const dataByCountry = countries.map((country) => {
      return {
        name: country,
        values: wildfireData.map((d) => ({
          year: d.year,
          country: d[country],
        })),
      };
    });

    // draw the lines
    const line = d3
      .line()
      .x((d) => x(d.year))
      .y((d) => y(d.country))
      .defined((d) => d.country != null);

    const path = chartGroup
      .append("g")
      .attr("fill", "none")
      .attr("stroke-width", 2)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .selectAll("path")
      .data(dataByCountry)
      .join("path")
      .attr("stroke", (d) => colour(d.name))
      .style("mix-blend-mode", "multiply")
      .attr("d", (d) => line(d.values));

      const circles = chartGroup
  .append("g")
  .selectAll("g")
  .data(dataByCountry)
  .join("g")
  .selectAll("circle")
  .data(d => d.values.map(v => ({...v, name: d.name}))) 
  .join("circle")
  .attr("fill", d => colour(d.name))
  .attr("cx", d => x(d.year))
  .attr("cy", d => y(d.country))
  .attr("r", 3)
  .attr("opacity", 0.9);

    // interactive tooltip
    const dot = svg.append("g").attr("display", "none");

    dot.append("circle").attr("r", 3);

    dot.append("text").attr("text-anchor", "middle").attr("y", -8);

    svg
      .on("pointerenter", pointerentered)
      .on("pointermove", pointermoved)
      .on("pointerleave", pointerleft)
      .on("touchstart", (event) => event.preventDefault());

    function pointermoved(event) {
      const [xm, ym] = d3.pointer(event);
      const closest = dataByCountry
        .flatMap((d) => d.values.map((v) => ({ ...v, name: d.name })))
        .reduce((a, b) =>
          Math.hypot(x(b.year) - xm, y(b.country) - ym) <
          Math.hypot(x(a.year) - xm, y(a.country) - ym)
            ? b
            : a
        );

      path
        .style("stroke", (d) => (d.name === closest.name ? null : "#ddd"))
        .filter((d) => d.name === closest.name)
        .raise();

        circles
          .attr("fill", (d) => (d.name === closest.name ? colour(d.name) : "#ddd"));

      dot.attr(
        "transform",
        `translate(${x(closest.year)},${y(closest.country)})`
      );
      
      dot
        .select("text")
        .text(`${closest.country}% of area burnt`); 
    }

    function pointerentered() {
      path.style("mix-blend-mode", null).style("stroke", "#ddd");
      circles.attr("fill", "#ddd");
      dot.attr("display", null);
    }

    function pointerleft() {
      path.style("mix-blend-mode", "multiply").style("stroke", null);
      circles.attr("fill", (d) => colour(d.name));
      dot.attr("display", "none");
    }

    // legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - 200}, 30)`);

    countries.forEach((country, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      legendRow
        .append("rect")
        .attr("width", 11)
        .attr("height", 11)
        .attr("fill", colour(country));

      legendRow
        .append("text")
        .attr("x", 15)
        .attr("y", 8)
        .attr("dy", "1.2 rem")
        .text(country)
        .attr("font-size", "14px");
    });
  }
})();