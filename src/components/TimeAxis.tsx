import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface TimeAxisProps {
    width: number;
    height: number;
    timespan: [Date, Date];
}

const TimeAxis: React.FC<TimeAxisProps> = ({ width, height, timespan }) => {
    const timeAxisRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        const margin = { top: 20, right: 25, bottom: 20, left: 25 };
        const axisWidth = width - margin.left - margin.right;

        // Define the timescale
        const timeScale = d3
            .scaleTime()
            .domain(timespan)
            .range([0, axisWidth]);

        // Set up SVG container for the time axis
        const timeAxisSvg = d3.select(timeAxisRef.current);
        timeAxisSvg.selectAll('*').remove();

        const timeAxisGroup = timeAxisSvg
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const xAxis = d3.axisBottom(timeScale);
        timeAxisGroup
            .call(xAxis)
            .selectAll('text')
            .style('text-anchor', 'middle');
    }, [timespan, width, height]);

    return <svg ref={timeAxisRef} className="timeAxis" width={width + 6} height={50} />;
};

export default TimeAxis;
