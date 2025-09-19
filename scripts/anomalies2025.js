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

    // quadrants
    const x0 = x(0);
    const y0 = y(0);

    // Quadrant rectangles
    g.append("rect")
      .attr("class", "topleft")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", x0)
      .attr("height", y0)
      .attr("fill", "red")
      .style("opacity", 0);

    g.append("rect")
      .attr("class", "topright")
      .attr("x", x0)
      .attr("y", 0)
      .attr("width", width - x0)
      .attr("height", y0)
      .attr("fill", "lightblue")
      .style("opacity", 0);

    g.append("rect")
      .attr("class", "bottomleft")
      .attr("x", 0)
      .attr("y", y0)
      .attr("width", x0)
      .attr("height", height - y0)
      .attr("fill", "yellow")
      .style("opacity", 0);

    g.append("rect")
      .attr("class", "bottomright")
      .attr("x", x0)
      .attr("y", y0)
      .attr("width", width - x0)
      .attr("height", height - y0)
      .attr("fill", "lightgreen")
      .style("opacity", 0);

    // reference lines
    g.append("line")
      .attr("class", "v_line")
      .attr("x1", x0)
      .attr("x2", x0)
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#000000ff")
      .attr("stroke-dasharray", "4,4")
      .style("opacity", 0);

    g.append("line")
      .attr("class", "h_line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", y0)
      .attr("y2", y0)
      .attr("stroke", "#000000ff")
      .attr("stroke-dasharray", "4,4")
      .style("opacity", 0);

    // Axes
    g.append("g")
      .attr("class", "x-axis")
      .style("opacity", 0)
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .call((g) => g.selectAll(".tick text").attr("font-size", "14px"));

    g.append("g")
      .attr("class", "y-axis")
      .style("opacity", 0)
      .call(d3.axisLeft(y))
      .call((g) => g.selectAll(".tick text").attr("font-size", "14px"));

    // Labels
    g.append("text")
      .attr("class", "xlabel")
      .attr("x", width / 2)
      .attr("y", height + 45)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text("Annual Rainfall (mm) Anomaly")
      .style("opacity", 0); // Annual Rainfall Anomaly (mm, vs 1991–2020)

    g.append("text")
      .attr("class", "ylabel")
      .attr("x", 5)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text("Annual Temperature (°C) Anomaly")
      .style("opacity", 0); // Annual Temperature Anomaly

    // Scatter dots
    g.selectAll(".dot")
      .data(data)
      .join("circle")
      .attr("class", "dot")
      .style("opacity", 0)
      .attr("cx", (d) => x(d.rain_anom_mm))
      .attr("cy", (d) => y(d.temp_anom_C))
      .attr("r", 4)
      // .attr("r", (d) => (d.year === 2025 ? 6 : 4))
      .attr("fill", "gray")
      // .attr("fill", (d) => (d.year === 2025 ? "#df0808ff" : "gray"))
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
      .attr("fill", "gray")
      .style("opacity", 0);

    g.append("text")
      .attr("class", "averagelabel")
      .attr("x", x(0) + 8)
      .attr("y", y(0) - 8)
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("1991–2020 average")
      .style("opacity", 0);

    //Reference Line text
    g.append("text")
      .attr("class", "xlabel1")
      .attr("x", x(0) + 5)
      .attr("y", height - 470)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text("← Drier   Wetter →")
      .style("opacity", 0);

    g.append("text")
      .attr("class", "ylabel1")
      .attr("x", width - 360)
      .attr("y", y(0) - 830)
      .attr("text-anchor", "end")
      .attr("font-size", "14px")
      .attr("transform", "rotate(90)")
      .text("← Hotter   Cooler →")
      .style("opacity", 0);

    g.append("text")
      .attr("x", x(0) - 38)
      .attr("y", y(0) + 38)
      .text("1913")
      .attr("class", "l1913")
      .style("font-size", "5px")
      .style("font-weight", "bold")
      .style("opacity", 0.7)
      .style("fill", "#000000ff")
      .style("opacity", 0);

    g.append("text")
      .attr("x", x(0) - 20)
      .attr("y", y(0) + 35)
      .text("1914")
      .attr("class", "l1914")
      .style("font-size", "5px")
      .style("font-weight", "bold")
      .style("opacity", 0.7)
      .style("fill", "#000000ff")
      .style("opacity", 0);

    g.append("text")
      .attr("x", x(0) + 128)
      .attr("y", y(0) + 39)
      .text("2012")
      .attr("class", "l2012")
      .style("font-size", "5px")
      .style("font-weight", "bold")
      .style("opacity", 0.7)
      .style("fill", "#000000ff")
      .style("opacity", 0);

    g.append("text")
      .attr("x", x(0) - 105)
      .attr("y", y(0) - 70)
      .text("2011")
      .attr("class", "l2011")
      .style("font-size", "5px")
      .style("font-weight", "bold")
      .style("opacity", 0.7)
      .style("fill", "#000000ff")
      .style("opacity", 0);

    g.append("text")
      .attr("x", x(0) - 62)
      .attr("y", y(0) - 42)
      .text("2018")
      .attr("class", "l2018")
      .style("font-size", "5px")
      .style("font-weight", "bold")
      .style("opacity", 0.7)
      .style("fill", "#000000ff")
      .style("opacity", 0);

    g.append("text")
      .attr("x", x(0) + 72)
      .attr("y", y(0) - 41)
      .text("2019")
      .attr("class", "l2019")
      .style("font-size", "5px")
      .style("font-weight", "bold")
      .style("opacity", 0.7)
      .style("fill", "#000000ff")
      .style("opacity", 0);

    g.append("text")
      .attr("x", x(0) + 12)
      .attr("y", y(0) - 33)
      .text("2021")
      .attr("class", "l2021")
      .style("font-size", "5px")
      .style("font-weight", "bold")
      .style("opacity", 0.7)
      .style("fill", "#000000ff")
      .style("opacity", 0);

    g.append("text")
      .attr("x", x(0) - 103)
      .attr("y", y(0) - 111)
      .text("2022")
      .attr("class", "l2022")
      .style("font-size", "5px")
      .style("font-weight", "bold")
      .style("opacity", 0.7)
      .style("fill", "#000000ff")
      .style("opacity", 0);

    g.append("text")
      .attr("x", x(0) - 115)
      .attr("y", y(0) - 130)
      .text("2025")
      .attr("class", "l2025")
      .style("font-size", "5px")
      .style("font-weight", "bold")
      .style("opacity", 0.7)
      .style("fill", "#000000ff")
      .style("opacity", 0);

    g.append("text")
      .attr("x", x(0) + 100)
      .attr("y", y(0) - 82)
      .text("2024")
      .attr("class", "l2024")
      .style("font-size", "5px")
      .style("font-weight", "bold")
      .style("opacity", 0.7)
      .style("fill", "#000000ff")
      .style("opacity", 0);
  });
})();
