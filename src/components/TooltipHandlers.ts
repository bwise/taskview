import * as d3 from "d3";
import { Selection } from "d3";

export interface TooltipData {
    name: string;
    startTime: Date;
    endTime: Date;
    retry: number;
}

/**
 * Attaches tooltip behavior to a D3 selection.
 * @param selection - The D3 selection to which the tooltip should be attached.
 * @param tooltipClass - The CSS class of the tooltip element.
 */
export const addTooltipHandlers = (
    selection: Selection<SVGGElement, TooltipData, SVGGElement, unknown>,
    tooltipClass: string
): void => {
    const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", tooltipClass)
        .style("visibility", "hidden");

    selection
        .on("mouseover", (event, d) => {
            tooltip
                .style("visibility", "visible")
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
};
