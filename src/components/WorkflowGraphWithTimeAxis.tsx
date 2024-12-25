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
    const containerRef = useRef<HTMLDivElement | null>(null);
    const timeAxisRef = useRef<SVGSVGElement | null>(null);
    const timespanRef = useRef<[Date, Date]>(initialTimespan);

    useEffect(() => {
        const margin = {top: 20, right: 20, bottom: 20, left: 20};
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
        svg
            .style("border", "2px solid black") // Add black border with 2px width
            .style("overflow", "hidden"); // Prevent overflow, allow zooming and scrolling
        timeAxisSvg.selectAll("*").remove();

        // Create tooltip
        const tooltip = d3
            .select("body")
            .append("div")
            .style("position", "absolute")
            .style("background", "#605d5d")
            .style("border", "2px solid black")
            .style("color", "white")
            .style("border-radius", "5px")
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
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const barHeight = 30;
        const barSpacing = 10;

        // Render Bars and Labels
        const activityGroup = chartGroup
            .selectAll("g.activity")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "activity")
            .attr("transform", (_, i) => `translate(0, ${i * (barHeight + barSpacing)})`);

        // Append the bar to each activity group
        activityGroup
            .append("rect")
            .attr("x", (d) => timeScale(d.startTime))
            .attr("y", 0)
            .attr("width", (d) => timeScale(d.endTime) - timeScale(d.startTime))
            .attr("height", barHeight)
            .attr("rx", 12) // Add horizontal corner radius
            .attr("ry", 12) // Add vertical corner radius
            .attr("fill", (d) => (d.retry > 0 ? "#d1dff2" : "#d2f1dd"))
            .attr("cursor", "pointer")
            .attr("stroke", (d) => (d.retry > 0 ? "#1e4ccf" : "#197c3b"))
            .attr("stroke-width", 3);

        // Append the label to each activity group
        activityGroup
            .append("text")
            .attr("class", "step-label")
            .attr("x", (d) => timeScale(d.startTime) + 10)
            .attr("y", barHeight / 1.5)
            .attr("text-anchor", "start")
            .attr("font-size", 15)
            .attr("font-weight", "bold")
            .attr("fill", (d) => (d.retry > 0 ? "#1e4ccf" : "#197c3b"))
            .attr("cursor", "pointer")
            .text((d) => `${d.name}`)
            .call((text) => {
                text.each(function (d) {
                    const node = this;
                    const textWidth = node.getBBox().width;
                    const barWidth = timeScale(d.endTime) - timeScale(d.startTime);
                    if (textWidth > barWidth) {
                        // Truncate text if it doesn't fit in the bar
                        d3.select(node).text((d) => `...${d.name.slice(0, 10)}`);
                    }
                });
            });

        // Tooltip handling for both bar and label
        activityGroup
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

        // Zoom Behavior (allows panning and zooming)
        const zoom = d3
            .zoom()
            .filter((event) => {
                // Allow panning (dragging) with mouse or touch gestures
                if (event.type === "mousedown" || event.type === "touchstart") return true;

                // Allow zooming only if Shift key is pressed during wheel events
                return event.type === "wheel" && event.shiftKey;
            })
            .scaleExtent([1, 10000]) // Limit zoom levels
            .translateExtent([
                [40, 40],
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

        // Apply zoom to the SVG (for zoom and pan)
        svg.call(zoom);

        return () => {
            svg.selectAll("*").remove();
            timeAxisSvg.selectAll("*").remove();
            tooltip.remove(); // Clean up the tooltip
        };
    }, [data, initialTimespan, width, height]);

    return (
    <div>
        <svg ref={timeAxisRef} width={width} height={50}/>
        <div
            ref={containerRef}
            style={{
                width,
                height,
                overflowY: "scroll",
                border: "1px solid black",
            }}
        >
            <svg ref={svgRef} height={data.length * 45} width={width}/>
        </div>
    </div>
)
    ;
};

export default WorkflowGraphWithTimeAxis;
