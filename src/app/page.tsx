"use client"

import WorkflowGraphWithTimeAxis from "@/components/WorkflowGraphWithTimeAxis";

export default function Home() {
    const data = [
        { name: "Step 1", startTime: new Date("2024-12-01T00:00:00"), endTime: new Date("2025-01-01T00:00:10"), retry: 0 },
        { name: "Step 2", startTime: new Date("2025-01-01T00:00:10"), endTime: new Date("2025-01-01T00:30:13"), retry: 1 },
        { name: "Step 3", startTime: new Date("2025-01-01T00:30:13"), endTime: new Date("2025-03-01T00:00:43"), retry: 0 },
        { name: "Step 4", startTime: new Date("2025-03-01T00:00:43"), endTime: new Date("2025-04-01T00:00:53"), retry: 2 },
        { name: "Step 5", startTime: new Date("2025-04-01T00:00:53"), endTime: new Date("2025-05-01T00:00:00"), retry: 1 },
        { name: "Step 6", startTime: new Date("2025-05-01T00:00:00"), endTime: new Date("2025-07-01T00:00:00"), retry: 0 },
        { name: "Step 7", startTime: new Date("2025-05-01T00:00:00"), endTime: new Date("2025-07-01T00:00:00"), retry: 0 },
        { name: "Step 8", startTime: new Date("2025-07-01T00:00:00"), endTime: new Date("2025-08-01T00:00:00"), retry: 1 },
        { name: "Step 9", startTime: new Date("2025-07-01T00:00:00"), endTime: new Date("2025-09-01T00:00:00"), retry: 0 },
        { name: "Step 10", startTime: new Date("2025-09-01T00:00:00"), endTime: new Date("2025-09-01T03:00:00"), retry: 0 },
        { name: "Step 11", startTime: new Date("2025-09-01T00:00:00"), endTime: new Date("2025-09-01T03:45:00"), retry: 0 },
        { name: "Step 13", startTime: new Date("2025-09-01T03:45:00"), endTime: new Date("2025-11-01T06:45:00"), retry: 2 },
    ];
    console.log(data);

    if (!Array.isArray(data)) {
        console.error('Steps is not an array:', data);
    }

    return (
    <div style={{"border":"2px solid black", "width":"1210px", "margin":"20px"}}>
      <main>
          <WorkflowGraphWithTimeAxis data={data} initialTimespan={[data[0].startTime, data[data.length-1].endTime]} height={400} width={1200}></WorkflowGraphWithTimeAxis>
      </main>
    </div>
  );
}
