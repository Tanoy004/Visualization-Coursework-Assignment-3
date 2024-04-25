import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Text, VStack } from "@chakra-ui/react";

interface AttributeMDSProps {
  data: Array<{ x: number; y: number; name: string }>;
  dimensions: string[];
  setDimensions: React.Dispatch<React.SetStateAction<string[]>>;
}

const AttMDS: React.FC<AttributeMDSProps> = ({
  data,
  dimensions,
  setDimensions,
}) => {
  const [selectedAttributes, setSelectedAttributes] = useState<number[]>([]);
  const [lines, setLines] = useState<{ source: number; target: number }[]>([]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const margin = { top: 25, right: 35, bottom: 35, left: 45 };
  const width = 650 - margin.left - margin.right;
  const height = 450 - margin.top - margin.bottom;
  const colorScale = d3.scaleOrdinal(d3.schemeTableau10);
  const dotColorScale = d3.scaleOrdinal(d3.schemeCategory10);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll("*").remove();
    svgElement
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-0 -6 11 11")
      .attr("refX", 6)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("xoverflow", "visible")
      .append("svg:path")
      .attr("d", "M 0,-6 L 11 ,0 L 0,6")
      .attr("fill", "#999")
      .style("stroke", "none");

    const svg = svgElement
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Scales
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
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Dimension 1");
    
    svg
      .append("g")
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("fill", "#000") // Set text color to black
      .attr("font-weight", "bold") // Set font weight to bold
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .style("text-anchor", "end")
      .text("Dimension 2");
    
    svg.selectAll(".dot").remove();

    svg
      .selectAll(".dot") // Select dots if any exist
      .data(data) // Bind data
      .join(
        // Enter + Update + Exit
        (enter) =>
          enter // Enter new dots
            .append("circle")
            .attr("class", "dot")
            .attr("cx", (d) => xScale(d.x))
            .attr("cy", (d) => yScale(d.y))
            .attr("r", 4)
            .style("fill", (d, i) => {
              return selectedAttributes.includes(i) ? "red" : "#000000";
            }),
        (update) =>
          update 
            .attr("cx", (d) => xScale(d.x))
            .attr("cy", (d) => yScale(d.y))
            .style("fill", "#000"),
        (exit) => exit.remove() 
      )
      .on("click", (event, d) => {
        console.log("clicked attribute");
        const index = data.findIndex((attr) => attr.name === d.name);
        console.log("index", index);
        const isSelected = selectedAttributes.find((attr) => attr === index);
        console.log("index", index);
        console.log("selected attributes", selectedAttributes);
        console.log("isSelected", isSelected);
        if (!isSelected) {
          if (selectedAttributes.length >= 1) {
            setLines([
              ...lines,
              {
                source: selectedAttributes[selectedAttributes.length - 1],
                target: index,
              },
            ]);
          }

          const temp = [...selectedAttributes, index];

          if (temp.length === dimensions.length) {
            setDimensions(temp.map((tt) => data[tt].name));
            setLines([]);
            setSelectedAttributes([]);
          } else {
            setSelectedAttributes([...selectedAttributes, index]);
          }
        }
      });
    svg
      .selectAll(".line")
      .data(lines)
      .join("line")
      .style("stroke", "#999")
      .style("stroke-width", 1)
      .attr("marker-end", "url(#arrowhead)")
      .attr("x1", (d) => xScale(data[d.source].x))
      .attr("y1", (d) => yScale(data[d.source].y))
      .attr("x2", (d) => xScale(data[d.target].x))
      .attr("y2", (d) => yScale(data[d.target].y));
    svg
      .selectAll(".text")
      .data(data)
      .join("text")
      .attr("class", "text")
      .attr("x", (d) => xScale(d.x) + 5) 
      .attr("y", (d) => yScale(d.y) - 3)
      .text((d) => d.name)
      .style("font-size", "10px") 
      .attr("dy", ".35em"); 
  }, [data, width, height, selectedAttributes]);

  return (
    <VStack gap={8}>
      <Text textAlign="center" fontSize="18px" fontWeight="bold" mb={4}>
        MDS Variables Plot
      </Text>
      <svg ref={svgRef}></svg>
    </VStack>
  );
};

export default AttMDS;
