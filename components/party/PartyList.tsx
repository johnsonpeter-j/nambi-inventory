"use client";

import { Party } from "./PartyForm";
import PartyCard from "./PartyCard";

interface PartyListProps {
  parties: Party[];
  loading: boolean;
  onEdit: (party: Party) => void;
  onDelete: (id: string) => void;
}

export default function PartyList({
  parties,
  loading,
  onEdit,
  onDelete,
}: PartyListProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-[#324d67] p-8 text-center">
        <p className="text-slate-500 dark:text-[#92adc9]">Loading...</p>
      </div>
    );
  }

  if (parties.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-[#324d67] p-8 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-400 dark:text-[#64748b] mb-4">
          groups
        </span>
        <p className="text-slate-500 dark:text-[#92adc9] text-lg mb-2">
          No parties found
        </p>
        <p className="text-slate-400 dark:text-[#64748b] text-sm">
          Click "Add Party" to create your first party
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {parties.map((party) => (
        <PartyCard
          key={party.id}
          party={party}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

