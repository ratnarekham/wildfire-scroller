//GROUPED  BAR CHART

(function () {
  d3.csv("data/burned_area_2025_by_country.csv", d3.autoType)
    .then((data) => {
      createChart(data);
    })
    .catch((error) => {
      console.error("Error loading CSV file:", error);
    });
  function createChart(data) {
    const width = 700;
    const height = 500;
    const margin = { top: 20, right: 30, bottom: 20, left: 50 };

    const svg = d3
      .select("#burnedarea2025")
      .append("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr(
        "style",
        " max-width: 700px; height: auto; overflow: visible; font: 0.8rem sans-serif; color: black; background-color: #ffffffff; align-items: center; margin-bottom: 0px;"
      );

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select("body").append("div").attr("class", "tooltip");

    const keys = Object.keys(data[0]).slice(1);

    //colours
    const colors = ["#0663c1ff", "#FF7F00", "#019201ff", "#df0808ff"];
    const colorScale = d3.scaleOrdinal().domain(keys).range(colors);

    // scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.month))
      .range([0, width - margin.left - margin.right])
      .padding(0.2);

    const xSubgroup = d3
      .scaleBand()
      .domain(keys)
      .range([0, xScale.bandwidth() + 3])
      .padding(0);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d3.max(keys, (k) => d[k]))])
      .range([height - margin.top - margin.bottom, 0]);

    // Bars
    g.append("g")
      .selectAll("g")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${xScale(d.month)},0)`)
      .selectAll("rect")
      .data((d) =>
        keys.map((key) => ({ key: key, value: d[key], month: d.month }))
      )
      .enter()
      .append("rect")
      .attr("x", (d) => xSubgroup(d.key))
      .attr("y", yScale(0))
      .attr("width", xSubgroup.bandwidth())
      .attr("height", 0)
      .attr("fill", (d) => colorScale(d.key))
      .style("mix-blend-mode", "multiply")
      .on("mouseover", function (event, d) {
        const countryName = d.key;

        g.selectAll("rect").style("opacity", 0.3).style("stroke", null);

        g.selectAll("rect")
          .filter((b) => b.key === countryName)
          .style("opacity", 1);

        tooltip
          .style("opacity", 1)
          .html(
            `<strong>${
              d.key
            }</strong><br>Burnt Area: ${d.value.toLocaleString()} ha`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px");
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px");
      })
      .on("mouseout", function () {
        g.selectAll("rect")
          .style("opacity", 1)
          .style("stroke", null)
          .style("stroke-width", null);

        tooltip.style("opacity", 0);
      })
      .transition()
      .duration(1800)
      .delay((d, i) => i * 300)
      .ease(d3.easeCubicOut)
      .attr("y", (d) => yScale(d.value))
      .attr("height", (d) => yScale(0) - yScale(d.value));

    // axes
    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .call((g) => g.selectAll(".tick text").attr("font-size", "14px"));

    g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(yScale).tickFormat(d3.format(",.0f")))
      .call((g) =>
        g
          .append("text")
          .text("Burnt Area (hectares)")
          .attr("fill", "black")
          .attr("text-anchor", "start")
          .attr("font-size", "14px")
          .attr("x", -50)
          .attr("y", -10)
      )
      .call((g) => g.selectAll(".tick text").attr("font-size", "14px"));

    // legend section
    const legend = g
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 250}, 30)`);

    const legendItems = legend
      .selectAll(".legend-item")
      .data(keys)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legendItems
      .append("rect")
      .attr("width", 11)
      .attr("height", 11)
      .style("fill", (d) => colorScale(d));

    legendItems
      .append("text")
      .attr("x", 15)
      .attr("y", 8)
      .attr("dy", "2 em")
      .text((d) => d);
  }
})();
