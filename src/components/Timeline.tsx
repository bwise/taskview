import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface TimelineProps {
    startDate: Date;
    endDate: Date;
}

const Timeline: React.FC<TimelineProps> = ({ startDate, endDate }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;

        const margin = { top: 20, right: 20, bottom: 20, left: 50 };
        const width = 800 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        const svg = d3
            .select(ref.current)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)
            .style("fill", "red");

        // Time scale
        const xScale = d3
            .scaleTime()
            .domain([startDate, endDate])
            .range([0, width]);

        const xAxis = svg
            .append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).ticks(d3.timeMonth));

        // Zoom behavior
        const zoom = d3
            .zoom<SVGSVGElement, unknown>()
            .scaleExtent([1 / 31536000, 10]) // Allows zooming from 1 year to 1 second
            .translateExtent([
                [0, 0],
                [width, height],
            ])
            .on("zoom", (event) => {
                const transform = event.transform;
                const newXScale = transform.rescaleX(xScale);
                xAxis.call(d3.axisBottom(newXScale).ticks(d3.timeFormat));
            });

        svg.call(zoom);

        // Cleanup function
        return () => {
            d3.select(ref.current).select("svg").remove();
        };
    }, [startDate, endDate]);

    return <div ref={ref}></div>;
};

export default Timeline;
