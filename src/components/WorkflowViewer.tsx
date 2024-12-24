"use client";

import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

interface TimeAxisProps {
    initialStartDate: Date;
    initialEndDate: Date;
}

const TimeAxis: React.FC<TimeAxisProps> = ({ initialStartDate, initialEndDate }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [timeRange, setTimeRange] = useState<[Date, Date]>([initialStartDate, initialEndDate]);

    useEffect(() => {
        const svgElement = svgRef.current;
        if (!svgElement) return;

        const [start, end] = timeRange;

        // Compute tick interval based on the time range
        const computeTickInterval = (start: Date, end: Date) => {
            const timespan = +end - +start;

            if (timespan > 5 * 365 * 24 * 60 * 60 * 1000) return d3.timeYear.every(1); // > 5 years
            if (timespan > 365 * 24 * 60 * 60 * 1000) return d3.timeMonth.every(1); // 1-5 years
            if (timespan > 30 * 24 * 60 * 60 * 1000) return d3.timeWeek.every(1); // 1-12 months
            if (timespan > 7 * 24 * 60 * 60 * 1000) return d3.timeDay.every(1); // 1 week - 1 month
            return d3.timeHour.every(1); // Less than 1 week
        };

        // Dimensions and margins
        const margin = { top: 20, right: 20, bottom: 40, left: 20 };
        const width = 800 - margin.left - margin.right;
        const height = 100;

        // Clear existing SVG content
        d3.select(svgElement).selectAll("*").remove();

        // Create SVG container
        const svg = d3
            .select(svgElement)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

        const chart = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

        // X Scale and Axis
        const xScale = d3.scaleTime().domain([start, end]).range([0, width]);
        const tickInterval = computeTickInterval(start, end);

        const xAxis = d3.axisBottom(xScale).ticks(tickInterval);
        const axisGroup = chart
            .append("g")
            .attr("transform", `translate(0, ${height / 2})`)
            .call(xAxis);

        // Rotate labels for better alignment
        axisGroup
            .selectAll("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-45)")
            .attr("dx", "-0.5em")
            .attr("dy", "0.5em");

        // Add Zoom and Pan functionality
        const zoom = d3
            .zoom()
            .scaleExtent([1, 10]) // Allow zoom between 1x and 10x
            .translateExtent([
                [0, 0],
                [width, 0],
            ])
            .on("zoom", (event) => {
                const transform = event.transform;

                // Update X scale with the new transform
                const rescaledX = transform.rescaleX(xScale);

                // Update X-axis with new scale
                axisGroup.call(xAxis.scale(rescaledX));

                // Update the time range in state
                setTimeRange(rescaledX.domain() as [Date, Date]);
            });

        // Attach zoom behavior
        svg.call(zoom);

        // Prevent zooming on click or double-click
        svg.on("dblclick.zoom", null);
    }, [timeRange]);

    return <svg ref={svgRef}></svg>;
};

export default TimeAxis;
