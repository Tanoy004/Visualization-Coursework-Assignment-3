import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Text, VStack } from "@chakra-ui/react";

interface DataMDSProps {
  data: Array<{ x: number; y: number }>;
  colorLabel: number[];
}

const DMDS: React.FC<DataMDSProps> = ({ data, colorLabel }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const margin = { top: 25, right: 35, bottom: 35, left: 45 };
  const width = 650 - margin.left - margin.right;
  const height = 450 - margin.top - margin.bottom;
  const dotColorScale = d3.scaleOrdinal(d3.schemeCategory10);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll("*").remove(); 

    const svg = svgElement
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent([...data], (d) => d.x) as [number, number])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent([...data], (d) => d.y) as [number, number])
      .range([height, 0]);
      svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("fill", "#000") // Set text color to black
      .attr("font-weight", "bold") // Set font weight to bold
      .attr("x", width)
      .attr("y", -7)
      .style("text-anchor", "end")
      .text("Dimension 1");
    
    svg
      .append("g")
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("fill", "#000") // Set text color to black
      .attr("font-weight", "bold") // Set font weight to bold
      .attr("transform", "rotate(-90)")
      .attr("y", 7)
      .attr("dy", "0.72em")
      .style("text-anchor", "end")
      .text("Dimension 2");    

    svg.selectAll(".dot").remove();

    svg
      .selectAll(".dot") 
      .data(data) 
      .join(
        (enter) =>
          enter 
            .append("circle")
            .attr("class", "dot")
            .attr("cx", (d) => xScale(d.x))
            .attr("cy", (d) => yScale(d.y))
            .attr("r", 2)
            .style("fill", (d, i) => {
              return dotColorScale(colorLabel[i].toString());
            }),
        (update) =>
          update 
            .attr("cx", (d) => xScale(d.x))
            .attr("cy", (d) => yScale(d.y))
            .style("fill", (d, i) => {
              return dotColorScale(colorLabel[i].toString());
            }),
        (exit) => exit.remove()
      );
  }, [data, width, height, colorLabel]);

  return (
    <VStack gap={8}>
      <Text textAlign="center" fontSize="18px" fontWeight="bold" mb={4}>
        MDS Data Plot
      </Text>
      <svg ref={svgRef}></svg>
    </VStack>
  );
};

export default DMDS;
