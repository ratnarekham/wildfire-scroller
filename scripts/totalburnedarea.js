//code is adapted from https://observablehq.com/@d3/multi-line-chart/2

//LINE CHART

(function () {
  d3.csv("data/totalareaburnt_clean.csv", d3.autoType).then((data) => {
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

  const width = 700;
  const height = 500;
  const marginTop = 20;
  const marginRight = 10;
  const marginBottom = 20;
  const marginLeft = 30;

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
      "#df0808ff",
      "#000000",
    ];

    const colour = d3
      .scaleOrdinal()
      .domain(Object.keys(wildfireData[0]).slice(1))
      .range(custom_colours);

    const chartContainer = d3.select("#totalburnedarea_chart");

    const svg = chartContainer
      .append("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr(
        "style",
        "width: 90%; max-width: 700px; height: auto; overflow: visible; font: 0.8rem sans-serif; color: black; background-color: #ffffffff; align-items: center; margin-bottom: 0px; text-align: centre;"
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
      .call((g) => g.selectAll(".tick text").attr("font-size", "0.8rem"));

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
          .text("Burnt Area (hectares)")
          .attr("font-size", "14px")
      )
      .call((g) => g.selectAll(".tick text").attr("font-size", "0.8rem"));

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
      .attr("stroke-width", 3)
      // .attr("stroke-linejoin", "round")
      // .attr("stroke-linecap", "round")
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
      .data((d) => d.values.map((v) => ({ ...v, name: d.name })))
      .join("circle")
      .attr("fill", (d) => colour(d.name));
    // .attr("cx", d => x(d.year))
    // .attr("cy", d => y(d.country));

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

      circles.attr("fill", (d) =>
        d.name === closest.name ? colour(d.name) : "#ddd"
      );

      dot.attr(
        "transform",
        `translate(${x(closest.year)},${y(closest.country)})`
      );

      dot.select("text").text(`${closest.country.toLocaleString()} ha`); //change this to hectares
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

// STACKED BAR CHART

// (function () {
//     d3.csv("data/totalareaburnt_clean.csv", d3.autoType).then(data => {
//         createChart(data);
//     }).catch(error => {
//         console.error("Error loading CSV file:", error);
//     });

//     function createChart(data) {

//           const width = 700;
//           const height = 500;
//           const margin = { top: 10, right: 10, bottom: 20, left: 10 };

//         const svg = d3.select("#totalburnedarea_chart")
//             .append("svg")
//              .attr("viewBox", [0, 0, width, height])
//             .attr(
//         "style",
//         " max-width: 700px; height: auto; overflow: visible; font: 14px sans-serif; padding: 10px; color: black; background-color: #ffffff; align-items: center; margin-bottom: 0px;"
//       );

//         const g = svg.append("g")
//             .attr("transform", `translate(${margin.left},${margin.top})`);

//         const tooltip = d3.select("body")
//             .append("div")
//             .attr("class", "tooltip");

//         const keys = Object.keys(data[0]).slice(1);

//         //colours
//         const colors = ['#0663c1ff', '#FF7F00', '#019201ff', '#df0808ff'];
//         const colorScale = d3.scaleOrdinal()
//             .domain(keys)
//             .range(colors);

//         const stack = d3.stack()
//             .keys(keys);

//         const stackedData = stack(data);

//         // scales
//         const xScale = d3.scaleBand()
//             .domain(data.map(d => d.year))
//             .range([0, width])
//             .padding(0.1);

//         const yScale = d3.scaleLinear()
//             .domain([0, d3.max(stackedData, d => d3.max(d, d => d[1]))])
//             .range([height, 0]);

//         // stacked bars with animation
//         const groups = g.selectAll(".layer")
//             .data(stackedData)
//             .enter()
//             .append("g")
//             .attr("class", "layer")
//             .style("fill", d => colorScale(d.key));

//         const bars = groups.selectAll("rect")
//             .data(d => d)
//             .enter()
//             .append("rect")
//             .attr("class", function(d) {
//                 const countryKey = d3.select(this.parentNode).datum().key;
//                 return `bar-segment country-${countryKey}`;
//             })
//             .attr("x", d => xScale(d.data.year))
//             .attr("width", xScale.bandwidth())
//             .attr("y", height)
//             .attr("height", 0)
//             .style("opacity", 1)
//             .on("mouseover", function(event, d) {
//                 const countryName = d3.select(this.parentNode).datum().key;
//                 const value = d[1] - d[0];

//                 // highlight same country on hover
//                 g.selectAll("rect")
//                     .style("opacity", 0.3);

//                 g.selectAll("rect")
//                     .filter(function() {
//                         return d3.select(this.parentNode).datum().key === countryName;
//                     })
//                     .style("opacity", 1)
//                     .style("stroke", "#fff")
//                     .style("stroke-width", 1);

//                 tooltip
//                     .style("opacity", 1)
//                     .html(`<strong>${countryName}</strong><br>Year: ${d.data.year}<br>Burnt Area: ${value.toLocaleString()} hectares`)
//                     .style("left", (event.pageX + 10) + "px")
//                     .style("top", (event.pageY - 10) + "px");
//             })
//             .on("mousemove", function(event) {
//         tooltip.style("left", (event.pageX + 10) + "px")
//                .style("top", (event.pageY - 10) + "px");
//       })
//             .on("mouseout", function() {
//                 g.selectAll("rect")
//                     .style("opacity", 1)
//                     .style("stroke", null)
//                     .style("stroke-width", null);

//                 tooltip.style("opacity", 0);
//             });

//         bars.transition()
//             .duration(1500)
//             .delay((d, i) => i * 300)
//             .ease(d3.easeCubicOut)
//             .attr("y", d => yScale(d[1]))
//             .attr("height", d => yScale(d[0]) - yScale(d[1]));

//         // year totals
//      const yearTotals = data.map(d => ({
//             year: d.year,
//             total: d3.sum(keys, key => d[key] || 0)
//         }));

//         const totalLabels = g.selectAll(".total-label")
//             .data(yearTotals)
//             .enter()
//             .append("text")
//             .attr("class", "total-label")
//             .attr("x", d => xScale(d.year) + xScale.bandwidth() / 2)
//             .attr("y", d => yScale(d.total) - 5)
//             .attr("text-anchor", "middle")
//             .style("font-size", "12px")
//             // .style("font-weight", "bold")
//             .style("opacity", 0)
//             .text(d => `${(d.total).toLocaleString()}`);

//         totalLabels.transition()
//             .duration(1000)
//             .delay(1200)
//             .ease(d3.easeCubicOut)
//             .style("opacity", 1);

//         // axes
//         g.append("g")
//             .attr("class", "axis")
//             .attr("transform", `translate(0,${height})`)
//             .call(d3.axisBottom(xScale))
//             .call((g) => g.selectAll(".tick text").attr("font-size", "14px"));

//         g.append("g")
//             .attr("class", "axis")
//             .call(d3.axisLeft(yScale).tickFormat(d3.format(",.0f")))
//             .call((g) => g.selectAll(".tick text").attr("font-size", "14px"));

//         //  axis labels
//         // g.append("text")
//         //     .attr("class", "axis-label")
//         //     .attr("transform", "rotate(-90)")
//         //     .attr("y", 0 - margin.left)
//         //     .attr("x", 0 - (height / 2))
//         //     .attr("dy", "1.2 em")
//         //     .style("text-anchor", "middle")
//         //     .text("Burnt Area (Hectares)");

//         // g.append("text")
//         //     .attr("class", "axis-label")
//         //     .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
//         //     .style("text-anchor", "middle")
//         //     .text("Year");

//         // legend section
//         const legend = g.append("g")
//             .attr("class", "legend")
//             .attr("transform", `translate(${width - 250}, 30)`);

//         const legendItems = legend.selectAll(".legend-item")
//             .data(keys)
//             .enter()
//             .append("g")
//             .attr("class", "legend-item")
//             .attr("transform", (d, i) => `translate(0, ${i * 20})`);

//         legendItems.append("rect")
//             .attr("width", 11)
//             .attr("height", 11)
//             .style("fill", d => colorScale(d));

//         legendItems.append("text")
//             .attr("x", 15)
//             .attr("y", 8)
//             .attr("dy", "2 em")
//             .text(d => d);
//     }
// })()
