import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { config } from "./GraphConfig"; // Import the config file
import "../app/graph.css";
import { addTooltipHandlers } from "./TooltipHandlers";
import WfGraphProps from "./WfGraphProps";

// Utility function to determine tick format
const getTickFormat = (rangeInMilliseconds: number): ((date: Date) => string) => {
    const formatYear = d3.timeFormat("%Y");
    const formatMonth = d3.timeFormat("%b %y");
    const formatDay = d3.timeFormat("%d %b %y");
    const formatTime = d3.timeFormat("%d %b %y %H:%M");

    if (rangeInMilliseconds > 1 * 365 * 24 * 60 * 60 * 1000) {
        return formatYear;
    } else if (rangeInMilliseconds > 6 * 30 * 24 * 60 * 60 * 1000) {
        return formatMonth;
    } else if (rangeInMilliseconds > 7 * 24 * 60 * 60 * 1000) {
        return formatDay;
    } else {
        return formatTime;
    }
};

const WfGraph: React.FC<WfGraphProps> = ({
                                             width = 1000,
                                             height = 400,
                                             data,
                                             initialTimespan = [new Date(Date.now() - 3600000), new Date()],
                                         }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const timeAxisRef = useRef<SVGSVGElement | null>(null);
    const timespanRef = useRef<[Date, Date]>(initialTimespan);

    useEffect(() => {
        const { margin, barHeight, barSpacing, stepBorderRadius, stepFontSize, stepColor, innerStepColor, retryStepColor, innerRetryStepColor } = config;

        const axisWidth = width - margin.left - margin.right;
        const axisHeight = height - margin.top - margin.bottom;

        const timeScale = d3.scaleTime()
            .domain(timespanRef.current)
            .range([0, axisWidth]);

        const minTime = d3.min(data, (d) => d.startTime) as Date;
        const maxTime = d3.max(data, (d) => d.endTime) as Date;

        const minPixel = timeScale(minTime);
        const maxPixel = timeScale(maxTime) + 15;

        const svg = d3.select(svgRef.current);
        const timeAxisSvg = d3.select(timeAxisRef.current);

        svg.selectAll("*").remove();
        timeAxisSvg.selectAll("*").remove();

        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip");

        const timeAxisGroup = timeAxisSvg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xAxis = d3.axisBottom(timeScale);
        const rangeInMilliseconds = timespanRef.current[1].getTime() - timespanRef.current[0].getTime();
        const tickFormat = getTickFormat(rangeInMilliseconds);

        timeAxisGroup.call(xAxis.tickFormat(tickFormat))
            .selectAll("text")
            .style("text-anchor", "middle");

        const chartGroup = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const activityGroup = chartGroup
            .selectAll("g.activity")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "activity")
            .attr("transform", (_, i) => `translate(0, ${i * (barHeight + barSpacing)})`);

        activityGroup.append("rect")
            .attr("x", (d) => timeScale(d.startTime))
            .attr("y", 0)
            .attr("width", (d) => timeScale(d.endTime) - timeScale(d.startTime))
            .attr("height", barHeight)
            .attr("rx", stepBorderRadius)
            .attr("ry", stepBorderRadius)
            .attr("fill", (d) => (d.retry > 0 ? innerRetryStepColor : innerStepColor))
            .attr("cursor", "pointer")
            .attr("stroke", (d) => (d.retry > 0 ? retryStepColor : stepColor))
            .attr("stroke-width", 3);

        activityGroup.append("text")
            .attr("class", "step-label")
            .attr("x", (d) => timeScale(d.startTime) + 10)
            .attr("y", barHeight / 1.5)
            .attr("text-anchor", "start")
            .attr("font-size", stepFontSize)
            .attr("font-weight", "bold")
            .attr("fill", (d) => (d.retry > 0 ? retryStepColor : stepColor))
            .attr("cursor", "pointer")
            .text((d) => `${d.name}`)
            .call((text) => {
                text.each(function (d) {
                    const node = this as SVGTextElement;
                    const textWidth = node.getBBox().width + 20;
                    const barWidth = timeScale(d.endTime) - timeScale(d.startTime);
                    if (textWidth > barWidth) {
                        d3.select(node).text(`...${d.name.slice(0, 10)}`);
                    }
                });
            });

        addTooltipHandlers(activityGroup, "tooltip");

        const zoom = d3.zoom()
            .filter((event) => {
                if (event.type === "mousedown" || event.type === "touchstart") return true;
                return event.type === "wheel" && event.shiftKey;
            })
            .scaleExtent([1, 5000])
            .translateExtent([
                [minPixel, 0],
                [maxPixel, axisHeight + 20],
            ])
            .on("zoom", (event) => {
                const newScale = event.transform.rescaleX(timeScale);
                const domain = newScale.domain();
                const newRangeInMilliseconds = domain[1].getTime() - domain[0].getTime();
                const updatedTickFormat = getTickFormat(newRangeInMilliseconds);

                timeAxisGroup.call(d3.axisBottom(newScale).tickFormat(updatedTickFormat));

                chartGroup.selectAll("rect")
                    .attr("x", (d) => newScale(d.startTime))
                    .attr("width", (d) => newScale(d.endTime) - newScale(d.startTime));

                chartGroup.selectAll("text.step-label")
                    .attr("x", (d) => newScale(d.startTime) + 10)
                    .each(function (d) {
                        const node: SVGTextElement = this;

                        // Cache the current display state of the text
                        const currentState = node.getAttribute("data-state"); // "full" or "truncated"
                        const fullText = d.name;
                        const truncatedText = `...${d.name.slice(0, 10)}`;

                        // Dynamic threshold calculation based on text length
                        const textLength = fullText.length;
                        const truncateThreshold = textLength * 8; // Dynamic width for truncation
                        const revertThreshold = truncateThreshold + 20; // Add a buffer zone for reverting

                        // Calculate the bar width
                        const barWidth = newScale(d.endTime) - newScale(d.startTime);

                        // Determine whether to change state
                        if (barWidth < truncateThreshold && currentState !== "truncated") {
                            d3.select(node).text(truncatedText).attr("data-state", "truncated");
                        } else if (barWidth >= revertThreshold && currentState !== "full") {
                            d3.select(node).text(fullText).attr("data-state", "full");
                        }
                    });
            });

        svg.call(zoom);

        return () => {
            svg.selectAll("*").remove();
            timeAxisSvg.selectAll("*").remove();
            tooltip.remove();
        };
    }, [data, initialTimespan, width, height]);

    return (
        <div>
            <svg ref={timeAxisRef} className="timeAxis" width={width + 6} height={50} />
            <div
                ref={containerRef}
                style={{
                    width,
                    height,
                    overflowY: "scroll",
                    border: "0px",
                }}
            >
                <svg ref={svgRef} height={data.length * 43} width={width} />
            </div>
        </div>
    );
};

export default WfGraph;
