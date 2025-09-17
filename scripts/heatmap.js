//code is adapted from https://observablehq.com/@mbostock/electric-usage-2019

(async function() {
  const margin = {top: 20, right: 10, bottom: 20, left: 40};
  const width = 800;

  const rawData = await d3.csv("data/wales_wildfirespermonth_clean.csv"); 

  const data = [];
  rawData.forEach(d => {
    const month = d.month;
    Object.keys(d).forEach(key => {
      if (key !== "month") {
        data.push({
          year: +key,
          month: month,
          wildfires: +d[key]
        });
      }
    });
  });

  const years = Array.from(new Set(data.map(d => d.year))).sort(d3.ascending);
  const months = Array.from(new Set(data.map(d => d.month)));
  const height = margin.top + margin.bottom + years.length * 20;

  // Scales
  const x = d3.scaleBand().domain(months).range([margin.left, width - margin.right]).padding(0.05);
  const y = d3.scaleBand().domain(years).range([margin.top, height - margin.bottom]).padding(0.05);
  const color = d3.scaleSequential([0, d3.max(data, d => d.wildfires)], d3.interpolateLab("white", "orange"));

  // Axes
  const xAxis = g => g
    .attr("transform", `translate(0,${margin.top})`)
    .call(d3.axisTop(x))
    .call(g => g.select(".domain").remove());

  const yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove());

    // Tooltip div
    const tooltip = d3.select("body").append("div").attr("class", "tooltip");


  const svg = d3.select("#heatmap")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  svg.append("g")
    .selectAll("rect")
    .data(data)
    .join("rect")
      .attr("x", d => x(d.month))
      .attr("y", d => y(d.year))
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .attr("fill", d => color(d.wildfires))
      .on("mouseover", function(event, d) {
        tooltip.transition().duration(200).style("opacity", 100);
        tooltip.html(
          `${d.month}, ${d.year} <br>
          <strong> ${d.wildfires} fires </strong>`
        )
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
      })
      .on("mousemove", function(event) {
        tooltip.style("left", (event.pageX + 10) + "px")
               .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        tooltip.transition().duration(200).style("opacity", );
      });


  svg.append("g").call(xAxis);
  svg.append("g").call(yAxis);
  
})();


// (async function() {
//   const margin = {top: 50, right: 30, bottom: 80, left: 100}; // extra bottom for legend
//   const width = 954;

//   const rawData = await d3.csv("data/wales_wildfirespermonth.csv");

//   // Unpivot
//   const data = [];
//   rawData.forEach(d => {
//     const month = d.month;
//     Object.keys(d).forEach(key => {
//       if (key !== "month") {
//         data.push({
//           year: +key,
//           month: month,
//           wildfires: +d[key]
//         });
//       }
//     });
//   });

//   const years = Array.from(new Set(data.map(d => d.year))).sort(d3.ascending);
//   const months = Array.from(new Set(data.map(d => d.month)));
//   const height = margin.top + margin.bottom + months.length * 20;

//   // Flip axes
//   const x = d3.scaleBand()
//     .domain(years)
//     .range([margin.left, width - margin.right])
//     .padding(0.05);

//   const y = d3.scaleBand()
//     .domain(months)
//     .range([margin.top, height - margin.bottom - 40]) // leave room for legend
//     .padding(0.05);

//   // Color scale green→red
//   const maxWildfires = d3.max(data, d => d.wildfires);
//   const color = d3.scaleSequential()
//     .domain([maxWildfires, 0]) // flip domain
//     .interpolator(d3.interpolateRdYlGn);

//   const xAxis = g => g
//     .attr("transform", `translate(0,${margin.top})`)
//     .call(d3.axisTop(x).tickFormat(d3.format("d")))
//     .call(g => g.select(".domain").remove());

//   const yAxis = g => g
//     .attr("transform", `translate(${margin.left},0)`)
//     .call(d3.axisLeft(y))
//     .call(g => g.select(".domain").remove());

//   const svg = d3.select("#heatmap")
//     .append("svg")
//     .attr("width", width)
//     .attr("height", height);

//   // Tooltip div
//   const tooltip = d3.select("body").append("div").attr("class", "tooltip");

//   // Draw heatmap with tooltips
//   svg.append("g")
//     .selectAll("rect")
//     .data(data)
//     .join("rect")
//       .attr("x", d => x(d.year))
//       .attr("y", d => y(d.month))
//       .attr("width", x.bandwidth())
//       .attr("height", y.bandwidth())
//       .attr("fill", d => color(d.wildfires))
//       .on("mouseover", function(event, d) {
//         tooltip.transition().duration(200).style("opacity", 1);
//         tooltip.html(
//           `<strong>Month:</strong> ${d.month}<br>
//            <strong>Year:</strong> ${d.year}<br>
//            <strong>Wildfires:</strong> ${d.wildfires}`
//         )
//         .style("left", (event.pageX + 10) + "px")
//         .style("top", (event.pageY - 28) + "px");
//       })
//       .on("mousemove", function(event) {
//         tooltip.style("left", (event.pageX + 10) + "px")
//                .style("top", (event.pageY - 28) + "px");
//       })
//       .on("mouseout", function() {
//         tooltip.transition().duration(200).style("opacity", 0);
//       });

//   svg.append("g").call(xAxis);
//   svg.append("g").call(yAxis);

//   // ====== Legend ======
//   const legendWidth = 300;
//   const legendHeight = 15;
//   const legendX = (width - legendWidth) / 2;
//   const legendY = height - margin.bottom + 30;

//   // Gradient definition
//   const defs = svg.append("defs");
//   const linearGradient = defs.append("linearGradient")
//     .attr("id", "legend-gradient");

//   linearGradient.selectAll("stop")
//     .data(d3.ticks(0, 1, 10))
//     .join("stop")
//       .attr("offset", d => d * 100 + "%")
//       .attr("stop-color", d => color(d * maxWildfires));

//   // Draw legend rect
//   svg.append("rect")
//     .attr("x", legendX)
//     .attr("y", legendY)
//     .attr("width", legendWidth)
//     .attr("height", legendHeight)
//     .style("fill", "url(#legend-gradient)");

//   // Legend scale
//   const legendScale = d3.scaleLinear()
//     .domain([0, maxWildfires])
//     .range([legendX, legendX + legendWidth]);

//   const legendAxis = d3.axisBottom(legendScale)
//     .ticks(5)
//     .tickFormat(d3.format("d"));

//   svg.append("g")
//     .attr("transform", `translate(0,${legendY + legendHeight})`)
//     .call(legendAxis);
// })();