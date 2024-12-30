"use client"

import WfGraph from "@/components/WfGraph";

export default function Home() {
    const data = [
        { name: "Vérif. Etat Civil", startTime: new Date("2024-12-01T00:00:00"), endTime: new Date("2025-01-01T00:00:10"), retry: 0 },
        { name: "Désact. Comptes", startTime: new Date("2025-01-01T00:00:10"), endTime: new Date("2025-01-01T00:30:13"), retry: 1 },
        { name: "Désact. Cartes", startTime: new Date("2025-01-01T00:30:13"), endTime: new Date("2025-03-01T00:00:43"), retry: 0 },
        { name: "Désact. Accès App.", startTime: new Date("2025-03-01T00:00:43"), endTime: new Date("2025-04-01T00:00:53"), retry: 2 },
        { name: "Ctrl. Solde", startTime: new Date("2025-04-01T00:00:53"), endTime: new Date("2025-05-01T00:00:00"), retry: 1 },
        { name: "Calc. intérêts", startTime: new Date("2025-05-01T00:00:00"), endTime: new Date("2025-07-01T00:00:00"), retry: 0 },
        { name: "Clot. CTO", startTime: new Date("2025-05-01T00:00:00"), endTime: new Date("2025-07-01T00:00:00"), retry: 0 },
        { name: "Clot. PEA", startTime: new Date("2025-07-01T00:00:00"), endTime: new Date("2025-08-01T00:00:00"), retry: 1 },
        { name: "Clot. DAV", startTime: new Date("2025-07-01T00:00:00"), endTime: new Date("2025-09-01T00:00:00"), retry: 0 },
        { name: "Suppr. Comptes", startTime: new Date("2025-09-01T00:00:00"), endTime: new Date("2025-09-01T03:00:00"), retry: 0 },
        { name: "Suppr. Client", startTime: new Date("2025-09-01T00:00:00"), endTime: new Date("2025-09-01T03:45:00"), retry: 0 },
        { name: "Nettoy. GDPR", startTime: new Date("2025-09-01T03:45:00"), endTime: new Date("2025-11-01T06:45:00"), retry: 2 },
    ];
    console.log(data);

    if (!Array.isArray(data)) {
        console.error('Steps is not an array:', data);
    }

    return (
    <div style={{"border":"2px solid black", "width":"1210px", "margin":"40px"}}>
      <main>
          <WfGraph data={data} initialTimespan={[data[0].startTime, data[data.length-1].endTime]} height={400} width={1200}></WfGraph>
      </main>
    </div>
  );
}
