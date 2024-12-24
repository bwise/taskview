import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import TimeAxis from "./TimeAxis";

interface WorkflowStep {
    name: string;
    startTime: Date;
    endTime: Date;
    retry: number;
}

interface WorkflowGraphProps {
    width?: number;
    height?: number;
    data: WorkflowStep[];
    initialTimespan?: [Date, Date];
}

const WorkflowGraph: React.FC<WorkflowGraphProps> = ({
                                                         width = 800,
                                                         height = 300,
                                                         data,
                                                         initialTimespan = [new Date(Date.now() - 3600000), new Date()],
                                                     }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const margin = { top: 40, right: 20, bottom: 40, left: 20 };
        const axisWidth = width - margin.left - margin.right;
        const axisHeight = height - margin.top - margin.bottom;

        // Define time scale
        const timeScale = d3
            .scaleTime()
            .domain(initialTimespan)
            .range([0, axisWidth]);

        // Clear previous content
        svg.selectAll("*").remove();

        // Create container for bars
        const chartGroup = svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Define bar height and spacing
        const barHeight = 20;
        const barSpacing = 10;

        // Render bars
        chartGroup
            .selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", (d) => timeScale(d.startTime))
            .attr("y", (_, i) => i * (barHeight + barSpacing))
            .attr("width", (d) => timeScale(d.endTime) - timeScale(d.startTime))
            .attr("height", barHeight)
            .attr("fill", (d) => (d.retry > 0 ? "orange" : "steelblue"))
            .attr("stroke", "black")
            .attr("stroke-width", 1);

        // Add text labels for the steps
        chartGroup
            .selectAll("text.step-label")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "step-label")
            .attr("x", (d) => timeScale(d.startTime) + 5)
            .attr("y", (_, i) => i * (barHeight + barSpacing) + barHeight / 1.5)
            .text((d) => `${d.name}`)
            .attr("font-size", 12)
            .attr("fill", "white");

        // Add retry icons and counts (only for retries > 0)
        const retryGroup = chartGroup
            .selectAll(".retry-group")
            .data(data.filter((d) => d.retry > 0)) // Only include items with retries > 0
            .enter()
            .append("g")
            .attr("class", "retry-group")
            .attr(
                "transform",
                (d, i) =>
                    `translate(${timeScale(d.startTime) - 20}, ${
                        i * (barHeight + barSpacing) + barHeight / 2
                    })`
            );

        retryGroup
            .append("path")
            .attr("d", "M4,0 A4,4 0 1,1 0,-4 L2,-4 L0,-8 L-2,-4 L0,-4") // Arrow path
            .attr("fill", "gray")
            .attr("transform", "scale(2)") // Scale for visibility
            .attr("x", -10);

        retryGroup
            .append("text")
            .attr("x", -10) // Place text just left of the bar
            .attr("y", 5)
            .text((d) => `x${d.retry}`)
            .attr("font-size", 10)
            .attr("fill", "gray");

        return () => {
            svg.selectAll("*").remove(); // Cleanup on unmount
        };
    }, [data, initialTimespan, width, height]);

    return (
        <div>
            <TimeAxis width={width} height={100} initialTimespan={initialTimespan} />
            <svg ref={svgRef} width={width} height={height} />
        </div>
    );
};

export default WorkflowGraph;
