import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface WorkflowStep {
    name: string;
    startTime: Date;
    endTime: Date;
    retry: number;
}

interface WorkflowGraphWithTimeAxisProps {
    width?: number;
    height?: number;
    data: WorkflowStep[];
    initialTimespan?: [Date, Date];
}

const WorkflowGraphWithTimeAxis: React.FC<WorkflowGraphWithTimeAxisProps> = ({
                                                                                 width = 800,
                                                                                 height = 300,
                                                                                 data,
                                                                                 initialTimespan = [new Date(Date.now() - 3600000), new Date()],
                                                                             }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const timeAxisRef = useRef<SVGSVGElement | null>(null);
    const timespanRef = useRef<[Date, Date]>(initialTimespan);

    useEffect(() => {
        const margin = { top: 20, right: 20, bottom: 40, left: 20 };
        const axisWidth = width - margin.left - margin.right;
        const axisHeight = height - margin.top - margin.bottom;

        // Define the time scale
        const timeScale = d3
            .scaleTime()
            .domain(timespanRef.current)
            .range([0, axisWidth]);

        // Set up SVG containers
        const svg = d3.select(svgRef.current);
        const timeAxisSvg = d3.select(timeAxisRef.current);

        svg.selectAll("*").remove();
        timeAxisSvg.selectAll("*").remove();

        // Create tooltip
        const tooltip = d3
            .select("body")
            .append("div")
            .style("position", "absolute")
            .style("background", "#6799be")
            .style("border", "1px solid black")
            .style("border-radius", "8px")
            .style("padding", "10px")
            .style("pointer-events", "none")
            .style("visibility", "hidden");

        // Time Axis
        const timeAxisGroup = timeAxisSvg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xAxis = d3.axisBottom(timeScale).ticks(10);
        timeAxisGroup
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "middle");

        // Workflow Graph
        const chartGroup = svg
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top + 40})`);

        const barHeight = 20;
        const barSpacing = 10;

        // Render Bars
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
            .attr("stroke-width", 1)
            .on("mouseover", (event, d) => {
                tooltip
                    .style("visibility", "visible")
                    .style("font-size", "10pt")
                    .html(`
                    <strong>${d.name}</strong><br/>
                    Start: ${d.startTime.toLocaleString()}<br/>
                    End: ${d.endTime.toLocaleString()}<br/>
                    Retries: ${d.retry}
                `);
            })
            .on("mousemove", (event) => {
                tooltip
                    .style("top", `${event.pageY + 10}px`)
                    .style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", () => {
                tooltip.style("visibility", "hidden");
            });

        // Add step labels
        chartGroup
            .selectAll("text.step-label")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "step-label")
            .attr("x", (d) => timeScale(d.startTime) + 5)
            .attr("y", (_, i) => i * (barHeight + barSpacing) + barHeight / 1.5)
            .text((d) => `${d.name}`)
            .attr("font-size", 15)
            .attr("fill", "white");

        // Zoom Behavior
        const zoom = d3
            .zoom()
            .scaleExtent([1, 10000]) // Limit zoom levels
            .translateExtent([
                [0, 0],
                [axisWidth, axisHeight],
            ])
            .on("zoom", (event) => {
                const newScale = event.transform.rescaleX(timeScale);

                // Update the time axis
                timeAxisGroup.call(d3.axisBottom(newScale));

                // Update the bars
                chartGroup
                    .selectAll("rect")
                    .attr("x", (d) => newScale(d.startTime))
                    .attr("width", (d) => newScale(d.endTime) - newScale(d.startTime));

                // Update the labels
                chartGroup
                    .selectAll("text.step-label")
                    .attr("x", (d) => newScale(d.startTime) + 5);
            });

        // Apply zoom to both SVGs
        svg.call(zoom);

        return () => {
            svg.selectAll("*").remove();
            timeAxisSvg.selectAll("*").remove();
            tooltip.remove(); // Clean up the tooltip
        };
    }, [data, initialTimespan, width, height]);

    return (
        <div>
            <svg ref={timeAxisRef} width={width} height={100} />
            <svg ref={svgRef} width={width} height={height} />
        </div>
    );
};

export default WorkflowGraphWithTimeAxis;
