import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Text, VStack } from "@chakra-ui/react";

interface KPlotProps {
  data: { k: number; MSE: number }[];
  selectedKIndex: number; 
  setSelectedKIndex: React.Dispatch<React.SetStateAction<number>>;
}

const KmeansPlot: React.FC<KPlotProps> = ({
  data,
  selectedKIndex,
  setSelectedKIndex,
}) => {
  const ref = useRef<SVGSVGElement | null>(null);

  const margin = { top: 15, right: 35, bottom: 45, left: 65 };
  const width = 660 - margin.left - margin.right;
  const height = 320 - margin.top - margin.bottom;

  useEffect(() => {
    if (!ref.current || data.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll(".plot-content").remove(); 

    const content = svg
      .append("g")
      .attr("class", "plot-content")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.k) as [number, number])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.MSE) as [number, number])
      .range([height, 0]);

    content
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 1.8)
      .attr(
        "d",
        d3
          .line<{ k: number; MSE: number }>()
          .x((d) => xScale(d.k))
          .y((d) => yScale(d.MSE))
      );

    content
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(d.k))
      .attr("cy", (d) => yScale(d.MSE))
      .attr("r", 5)
      .attr("fill", (d) =>
        selectedKIndex !== null && d === data[selectedKIndex]
          ? "steelblue"
          : "red"
      )
      .on("click", (_, d) => setSelectedKIndex(data.indexOf(d)));
    const xAxis = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${height + margin.top})`)
      .call(d3.axisBottom(xScale));

    const yAxis = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .call(d3.axisLeft(yScale));
      xAxis
      .append("text")
      .attr("fill", "#000")
      .attr("x", width / 2)
      .attr("y", 30) 
      .style("text-anchor", "middle")
      .style("font-weight", "bold") // Make the text bold
      .text("Number of Clusters (K value)");
    
    yAxis
      .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", -50) 
      .attr("x", -height / 2)
      .style("text-anchor", "end")
      .style("font-weight", "bold") // Make the text bold
      .text("MSE Error");
    

    content.selectAll(".selected-line").remove();
    if (selectedKIndex !== null) {
      content
        .append("line")
        .attr("class", "selected-line")
        .style("stroke", "black")
        .style("stroke-width", 1)
        .style("stroke-dasharray", "3, 3")
        .attr("x1", xScale(data[selectedKIndex].k))
        .attr("y1", 0)
        .attr("x2", xScale(data[selectedKIndex].k))
        .attr("y2", height);
    }
    return () => {
      svg.selectAll(".plot-content").remove();
      svg.selectAll("g").remove();
    };
  }, [data, selectedKIndex, height, width, margin]);

  return (
    <VStack gap={12}>
      <Text textAlign="center" fontSize="18px" fontWeight="bold" mb={4}>
        K-Means MSE Plot
      </Text>
      <svg
        ref={ref}
        width={width + margin.left + margin.right}
        height={height + margin.top + margin.bottom}
      />
    </VStack>
  );
};

export default KmeansPlot;
