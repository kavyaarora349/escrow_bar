import React from "react";
import { AlertCircle, FileText, Gavel } from "lucide-react";

export const DisputesView: React.FC = () => {
  const mockDisputes = [
    {
      id: "dsp-1",
      bountyTitle: "Implement Smart Contract for Escrow",
      disputedBy: "Creator",
      reason: "Work submitted does not meet security requirements",
      status: "Under Review",
      amount: "250 ALGO",
      date: "10/8/2026",
    },
    {
      id: "dsp-2",
      bountyTitle: "Design Landing Page Mockup",
      disputedBy: "Hunter",
      reason: "Creator unresponsive after submission",
      status: "Awaiting Creator",
      amount: "100 ALGO",
      date: "10/9/2026",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Active Disputes</h1>
        <p className="text-slate-400">Manage and review ongoing arbitrations.</p>
      </div>

      <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[#27272a] flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Gavel className="h-5 w-5 text-red-500" />
            Dispute Cases
          </h3>
          <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-semibold">
            {mockDisputes.length} Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0f0f11] text-slate-400 border-b border-[#27272a]">
              <tr>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Bounty</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Disputed By</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Reason</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Date</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Locked Amount</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {mockDisputes.map((dispute) => (
                <tr key={dispute.id} className="hover:bg-[#202024] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-[#27272a] flex items-center justify-center flex-shrink-0 group-hover:bg-slate-700 transition-colors">
                        <FileText className="h-4 w-4 text-slate-400" />
                      </div>
                      <span className="font-medium text-slate-200">{dispute.bountyTitle}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#27272a] text-slate-300 text-xs font-medium">
                      {dispute.disputedBy}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-400 max-w-xs truncate">
                      <AlertCircle className="h-4 w-4 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{dispute.reason}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{dispute.date}</td>
                  <td className="px-6 py-4 font-mono font-medium text-slate-300">{dispute.amount}</td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        dispute.status === "Under Review"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                      }`}
                    >
                      {dispute.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
