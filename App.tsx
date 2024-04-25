import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import { debounce } from "lodash";
import { ChakraProvider, Box, Radio, RadioGroup, Stack, Text } from "@chakra-ui/react";
import KPlot from "./Components/KmeansPlot";
import { useData } from "./Components/Datacon";
import DataMDS from "./Components/DMDS";
import AttributeMDS from "./Components/AttMDS";
import NumericalPCP from "./Components/NuPCP";
import PCP from "./Components/PCP";
import "./App.css";

export type DynamicObject = {
  [key: string]: number;
};

interface ResItem {
  x: number;
  y: number;
}

export type EigenVectorType = { name: string; coefficient: [number, number] };

interface ResItem2 {
  x: number;
  y: number;
  name: string;
}

function App() {
  const [displayType, setDisplayType] = useState<string>("data");
  const [selectedPCABar, setSelectedPCABar] = useState<number>(1);
  const [selectedKIndex, setSelectedKIndex] = useState<number>(2);
  const [indexListForAllPCA, setIndexListForAllPCA] = useState<number[][]>([
    [0, 1, 2, 3, 4],
    [0, 1, 2, 3, 4],
  ]);
  const [colorLabel, setColorLabel] = useState<number[]>([]);
  const [mdsDataDots, setMdsDataDots] = useState<ResItem[]>([]);
  const [attributesDataDots, setAttributesDataDots] = useState<ResItem2[]>([]);

  const { data, error, loading } = useData();

  const col_dimensions = Object.keys(data?.dataset?.[0] ?? []);

  const [dimensions, setDimensions] = useState<string[]>(col_dimensions);

  const [allDimensions, setAllDimensions] = useState<string[]>(
    Object.keys(data?.all_dataset?.[0] ?? {})
  );

  const columnNameList = data?.col ?? [];
  const dataset = data?.dataset ?? [[]];

  useEffect(() => {
    const temMdsData: ResItem[] = data?.mds_data ?? [];
    const temMdsAttributes: ResItem2[] = data?.attributes_data ?? [];
    const tdata = Object.keys(data?.dataset?.[0] || {});

    setAttributesDataDots(temMdsAttributes);
    setMdsDataDots(temMdsData);
    setDimensions(tdata);
    setAllDimensions(Object.keys(data?.all_dataset?.[0] || {}));
  }, [data]);

  useEffect(() => {
    const clusterColor =
      data?.kmeans[selectedKIndex].cluster_labels ?? Array(500).fill(0);

    setColorLabel(clusterColor);
  }, [data, selectedKIndex, columnNameList]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data available</div>;

  const kList = data.kmeans;
  const kPlotData = kList.map(({ k, MSE }) => ({ k, MSE }));

  return (
    <ChakraProvider>
      <Stack>
        <Box bg="blue.500" p="4">
          <Text textAlign="center" fontWeight="bold" fontSize="2xl" color="white">
            Life Expectancy Analysis
          </Text>
        </Box>
        <RadioGroup onChange={setDisplayType} value={displayType}>
          <Stack
            direction="row"
            spacing={8}
            marginTop="35px"
            justifyContent="center"
          >
            <Radio value="data">For Data</Radio>
            <Radio value="attributes">For Variables / Attributes</Radio>
          </Stack>
        </RadioGroup>
        <Stack gap={2.5} padding={2.5}>
          {}
          <Box overflowY="auto" p={4}>
            {displayType == "data" && (
              <DataMDS data={mdsDataDots} colorLabel={colorLabel} />
            )}
            {displayType == "attributes" && (
              <AttributeMDS
                data={attributesDataDots}
                dimensions={dimensions}
                setDimensions={setDimensions}
              />
            )}
          </Box>

          <Box overflowY="auto" p={4}>
            <KPlot
              data={kPlotData}
              selectedKIndex={selectedKIndex}
              setSelectedKIndex={setSelectedKIndex}
            />
          </Box>

          {}
          <Box overflowY="auto" p={4} boxShadow="base">
            {displayType == "data" && (
              <PCP
                data={data.all_dataset ?? []}
                colorId={colorLabel}
                dimensions={allDimensions}
                setDimensions={setAllDimensions}
              />
            )}
            {displayType == "attributes" && (
              <NumericalPCP
                data={data.dataset ?? []}
                colorId={colorLabel}
                dimensions={dimensions}
                setDimensions={setDimensions}
              />
            )}
          </Box>
        </Stack>
      </Stack>
    </ChakraProvider>
  );
}

export default App;
