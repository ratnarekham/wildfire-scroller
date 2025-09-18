(function () {
  const margin = { top: 20, right: 30, bottom: 30, left: 50 },
    width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  const svg = d3
    .select("#anomalieschart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr(
      "style",
      "max-width: 700px; height: auto; overflow: visible; font: 0.8rem sans-serif; color: black; background-color: #ffffffff; align-items: center; margin-bottom: 0px;"
    );

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Tooltip div
  const tooltip = d3.select("body").append("div").attr("class", "tooltip");

  d3.csv("data/wales_annual_rain_temp_anomalies.csv").then((data) => {
    data.forEach((d) => {
      d.rain_anom_mm = +d.rain_anom_mm;
      d.temp_anom_C = +d.temp_anom_C;
      d.year = +d.year;
    });

    // Scales
    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.rain_anom_mm))
      .nice()
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.temp_anom_C))
      .nice()
      .range([height, 0]);

    // Quadrant rectangles
    const x0 = x(0);
    const y0 = y(0);

    // Axes and 0-lines
    g.append("line")
      .attr("x1", x0)
      .attr("x2", x0)
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#333333")
      .attr("stroke-dasharray", "4,4");

    g.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", y0)
      .attr("y2", y0)
      .attr("stroke", "#333333")
      .attr("stroke-dasharray", "4,4");

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .call((g) => g.selectAll(".tick text").attr("font-size", "14px"));

    g.append("g")
      .call(d3.axisLeft(y))
      .call((g) => g.selectAll(".tick text").attr("font-size", "14px"));

    // Labels
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + 45)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text("Annual Rainfall (mm) Anomaly"); // Annual Rainfall Anomaly (mm, vs 1991–2020)

    g.append("text")
      .attr("x", 5)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text("Annual Temperature (°C) Anomaly"); // Annual Temperature Anomaly

    // Scatter dots
    g.selectAll(".dot")
      .data(data)
      .join("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(d.rain_anom_mm))
      .attr("cy", (d) => y(d.temp_anom_C))
      .attr("r", (d) => (d.year === 2025 ? 6 : 4))
      .attr("fill", (d) => (d.year === 2025 ? "#df0808ff" : "gray"))
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1);
        tooltip
          .html(
            `<strong>${d.year}</strong><br>
                        Rainfall anomaly: ${d.rain_anom_mm.toFixed(1)} mm<br>
                        Temp anomaly: ${d.temp_anom_C.toFixed(2)} °C`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    // 1991 - 2020 average dot + text
    g.append("circle")
      .attr("cx", x(0))
      .attr("cy", y(0))
      .attr("r", 4)
      .attr("fill", "gray");

    g.append("text")
      .attr("x", x(0) + 8)
      .attr("y", y(0) - 8)
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("opacity", 0.5)
      .text("1991–2020 average");

    // Reference lines
    g.append("line")
      .attr("x1", x(0))
      .attr("x2", x(0))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "black")
      .attr("stroke-dasharray", "4,4");

    g.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", y(0))
      .attr("y2", y(0))
      .attr("stroke", "black")
      .attr("stroke-dasharray", "4,4");

    //Reference Line text
    g.append("text")
      .attr("x", x(0) + 5)
      .attr("y", height - 470)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text("← Drier | Wetter →");

    g.append("text")
      .attr("x", width - 360)
      .attr("y", y(0) - 830)
      .attr("text-anchor", "end")
      .attr("font-size", "14px")
      .attr("transform", "rotate(90)")
      .text("← Hotter | Colder →");

    g.append("text")
      .attr("x", x(0) - 125)
      .attr("y", y(0) - 132)
      .text("2025")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("opacity", 0.7)
      .style("fill", "#df0808ff");
  });
})();
