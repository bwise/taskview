interface WorkflowStep {
    name: string;
    startTime: Date;
    endTime: Date;
    retry: number;
}

export default WorkflowStep;
