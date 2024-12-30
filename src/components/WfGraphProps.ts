import WorkflowStep from "@/components/WorkflowStep";

interface WfGraphProps {
    width?: number;
    height?: number;
    data: WorkflowStep[];
    initialTimespan?: [Date, Date];
}

export default WfGraphProps;
