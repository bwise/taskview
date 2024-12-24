import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface TimeAxisProps {
    width?: number;
    height?: number;
    initialTimespan?: [Date, Date];
}

const TimeAxis: React.FC<TimeAxisProps> = ({
                                               width = 800,
                                               height = 100,
                                               initialTimespan = [new Date(Date.now() - 3600000), new Date()],
                                           }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const timespanRef = useRef<[Date, Date]>(initialTimespan);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const margin = { top: 20, right: 20, bottom: 20, left: 20 };
        const axisWidth = width - margin.left - margin.right;

        const timeScale = d3
            .scaleTime()
            .domain(timespanRef.current)
            .range([0, axisWidth]);

        // Define the axis
        const xAxis = d3.axisBottom(timeScale).ticks(10);

        // Add the axis group
        const axisGroup = svg
            .append("g")
            .attr("transform", `translate(${margin.left},${height - margin.bottom})`)
            .call(xAxis);

        // Style the labels
        axisGroup
            .selectAll("text")
            .attr("dy", "0.5em")
            .style("text-anchor", "middle");

        // Define zoom behavior for panning
        const zoom = d3
            .zoom()
            .scaleExtent([1, 1000]) // Disable zoom scaling, only allow panning
            .translateExtent([
                [0, 0],
                [axisWidth, 0],
            ]) // Limit panning to the visible area
            .on("zoom", (event) => {
                const newScale = event.transform.rescaleX(timeScale);
                axisGroup.call(d3.axisBottom(newScale));
            });
        svg.call(zoom);

        return () => {
            svg.selectAll("*").remove(); // Cleanup on unmount
        };
    }, [width, height]);

    return <svg ref={svgRef} width={width} height={height} />;
};

export default TimeAxis;
