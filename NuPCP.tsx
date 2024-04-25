import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { debounce } from "lodash";

export type DataRecord = Record<string, number | string>;
export type DataType = Record<string, number | string> & {
  colorId: string;
};

interface NumericalPCPProps {
  data: DataRecord[];
  colorId: number[];
  dimensions: string[];
  setDimensions: React.Dispatch<React.SetStateAction<string[]>>;
}

type Scales = {
  [dimension: string]: d3.ScaleLinear<number, number, never>;
};

const NuPCP = ({
  data,
  colorId,
  dimensions,
  setDimensions,
}: NumericalPCPProps) => {
  const ref = useRef(null);
  const [highlightedCluster, setHighlightedCluster] = useState<string | null>(
    null
  );
  const [isMouseOverLine, setIsMouseOverLine] = useState(false);
  const stringColorId = colorId.map((id) => id.toString());

  const [selectedDimensions, setSelectedDimensions] = useState<number[]>([]);

  const concatenatedData: DataType[] = data.map((item, index) => ({
    ...item,
    colorId: stringColorId[index],
  }));

  const color = d3
    .scaleOrdinal()
    .domain(stringColorId)
    .range(d3.schemeTableau10);

  const doNotHighlight = debounce(function () {
    if (!isMouseOverLine) {
      d3.selectAll(".line")
        .transition()
        .duration(220)
        .style("stroke", (datum: any) => color(datum.Species) as string)
        .style("opacity", "1");
    }
  }, 220);

  const [mouseoutTimeoutId, setMouseoutTimeoutId] =
    useState<NodeJS.Timeout | null>(null);

  const handleMouseOut = () => {
    doNotHighlight();
  };

  const swapDimensions = (index1: number, index2: number) => {
    if (index1 === -1 || index2 === -1) return;
    let newDimensions = [...dimensions];
    [newDimensions[index1], newDimensions[index2]] = [
      newDimensions[index2],
      newDimensions[index1],
    ];
    setDimensions(newDimensions);
  };

  const handleMouseOver = (d: DataType) => {
    if (highlightedCluster !== d.colorId) setHighlightedCluster(d.colorId);
    setIsMouseOverLine(true);
    d3.selectAll(`.line`)
      .transition()
      .duration(220)
      .style("stroke", (datum: any) =>
        datum.colorId === d.colorId
          ? (color(datum.colorId) as string)
          : "lightgrey"
      )
      .style("opacity", (datum: any) =>
        datum.colorId === d.colorId ? 1 : 0.3
      );
  };

  const handleAxisClick = (clickedDimension: number) => {
    console.log("axis clicked");
    const updatedSelection = selectedDimensions.includes(clickedDimension)
      ? []
      : [...selectedDimensions, clickedDimension];

    if (updatedSelection.length < 2) {
      setSelectedDimensions(updatedSelection);
    } else if (updatedSelection.length === 2) {
      swapDimensions(updatedSelection[0], updatedSelection[1]);
      setSelectedDimensions([]);
    }
  };

  const debouncedMouseOver = debounce(handleMouseOver, 350);
  const debouncedMouseOut = debounce(handleMouseOut, 850);

  useEffect(() => {
    const margin = { top: 35, right: 55, bottom: 15, left: 55 },
      width = 1250 - margin.left - margin.right,
      height = 550 - margin.top - margin.bottom;
    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const y: Scales = dimensions.reduce((acc: Scales, dimension: string) => {
      const extent = d3.extent(data, (d) => +d[dimension]) as [number, number];

      return {
        ...acc,
        [dimension]: d3
          .scaleLinear()
          .domain(extent)
          .range([height, 0]),
      };
    }, {} as Scales);

    const x = d3.scalePoint().range([0, width]).domain(dimensions);

    const lineGenerator = d3.line<[number, number]>();

    svg
      .selectAll("path")
      .data(concatenatedData)
      .join("path")
      .attr("class", (d: DataType) => `line ${d.colorId}`)
      .attr("d", (d: DataType) =>
        lineGenerator(
          dimensions.map((p) => {
            const val: number = d[p as keyof DataType] as unknown as number;
            return [x(p), y[p](val)] as [number, number];
          })
        )
      )
      .style("fill", "none")
      .style("stroke", (d: DataType) => color(d.colorId) as string)
      .style("opacity", 1)
      .on("mouseover", (event, d) => {
        event.preventDefault();

        handleMouseOver(d);
      })
      .on("mouseout", (event) => {
        event.preventDefault();
        setIsMouseOverLine(false);
        debouncedMouseOut();
      });

    // // Axes
    svg
      .selectAll("myAxis")
      .data(dimensions)
      .enter()
      .append("g")
      .attr("class", "axis")
      .attr("transform", (d) => `translate(${x(d)})`)
      .each(function (d) {
        d3.select(this).call(d3.axisLeft(y[d]).ticks(5));
      })
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text((d) => d)
      .style("fill", (d, i) =>
        selectedDimensions.includes(i) ? "purple" : "black"
      )
      .on("click", function (event, d) {
        console.log("Clicked!");
        const index = dimensions.indexOf(d);
        handleAxisClick(index);
      });
    return () => {
      if (mouseoutTimeoutId) clearTimeout(mouseoutTimeoutId);
      debouncedMouseOver.cancel();
      debouncedMouseOut.cancel();
      d3.select(ref.current).select("svg").remove();
    };
  }, [highlightedCluster, colorId, selectedDimensions, dimensions]);

  return (
    <div style={{ textAlign: "center" }}>
      <h2 style={{ fontWeight: "bold" }}>Parallel Coordinates Plot (Numerical Attributes)</h2>
      <div ref={ref} id="my_dataviz" />
    </div>
  );
};

export default NuPCP;
