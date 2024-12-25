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
        { name: "Step 8", startTime: new Date("2025-07-01T00:00:00"), endTime: new Date("2025-08-01T00:00:00"), retry: 0 },
        { name: "Step 9", startTime: new Date("2025-07-01T00:00:00"), endTime: new Date("2025-09-01T00:00:00"), retry: 0 },
        { name: "Step 10", startTime: new Date("2025-09-01T00:00:00"), endTime: new Date("2025-09-01T03:00:00"), retry: 0 },
        { name: "Step 11", startTime: new Date("2025-09-01T00:00:00"), endTime: new Date("2025-09-01T03:45:00"), retry: 0 },
        { name: "Step 13", startTime: new Date("2025-09-01T03:45:00"), endTime: new Date("2025-11-01T06:45:00"), retry: 0 },
    ];
    console.log(data);

    if (!Array.isArray(data)) {
        console.error('Steps is not an array:', data);
    }

    return (
    <div>
      <main>

          <WorkflowGraphWithTimeAxis data={data} initialTimespan={[data[0].startTime, data[data.length-1].endTime]} height={200} width={800}></WorkflowGraphWithTimeAxis>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/legal-terms"
          target="_blank"
          rel="noopener noreferrer">Legal Terms
        </a>
      </footer>
    </div>
  );
}
