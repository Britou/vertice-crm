"use client";

import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  type Lead,
  type LeadSource,
  type LeadStatus,
} from "@/types/lead";

type PipelineColumn = {
  status: LeadStatus;
  title: string;
  badgeClass: string;
};

const pipelineColumns: PipelineColumn[] = [
  {
    status: "NOVO",
    title: "Novos",
    badgeClass: "bg-sky-100 text-sky-700",
  },
  {
    status: "CONTATO",
    title: "Em contato",
    badgeClass: "bg-amber-100 text-amber-700",
  },
  {
    status: "PROPOSTA",
    title: "Proposta",
    badgeClass: "bg-violet-100 text-violet-700",
  },
  {
    status: "GANHO",
    title: "Ganho",
    badgeClass: "bg-emerald-100 text-emerald-700",
  },
  {
    status: "PERDIDO",
    title: "Perdido",
    badgeClass: "bg-rose-100 text-rose-700",
  },
];

const sourceLabels: Record<LeadSource, string> = {
  SITE: "Site",
  INDICACAO: "Indicação",
  INSTAGRAM: "Instagram",
  OUTRO: "Outro",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

type LeadPipelineProps = {
  leads: Lead[];
  isDeletingId: string | null;
  isUpdatingId: string | null;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
};

type PipelineColumnProps = LeadPipelineProps & {
  column: PipelineColumn;
  className?: string;
};

type LeadCardProps = {
  lead: Lead;
  isDeleting: boolean;
  isUpdating: boolean;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
};

function LeadCard({
  lead,
  isDeleting,
  isUpdating,
  onDelete,
  onStatusChange,
}: LeadCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h4 className="font-bold">{lead.name}</h4>
      <p className="mt-1 text-sm text-slate-500">{lead.company}</p>

      <div className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-sm">
        <p className="text-slate-500">{sourceLabels[lead.source]}</p>
        <p className="font-semibold text-slate-700">
          {formatCurrency(lead.estimatedValue)}
        </p>
      </div>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_40px] gap-2">
        <select
            aria-label={`Mover ${lead.name} para outra etapa`}
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            disabled={isUpdating}
            onChange={(event) =>
            onStatusChange(
                lead._id,
                event.target.value as LeadStatus,
            )
            }
            value={lead.status}
        >
            {pipelineColumns.map((column) => (
            <option key={column.status} value={column.status}>
                {column.title}
            </option>
            ))}
        </select>

        <button
            aria-label={`Excluir ${lead.name}`}
            className="grid h-9 w-10 place-items-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isDeleting}
            onClick={() => onDelete(lead._id)}
            type="button"
        >
            {isDeleting ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
            <Trash2 className="h-4 w-4" />
            )}
        </button>
        </div>
    </article>
  );
}

function PipelineColumn({
  column,
  leads,
  isDeletingId,
  isUpdatingId,
  onDelete,
  onStatusChange,
  className,
}: PipelineColumnProps) {
  const leadsInColumn = leads.filter(
    (lead) => lead.status === column.status,
  );

  return (
    <section
      className={`rounded-xl bg-slate-50 p-3 ${className ?? ""}`}
    >
      <header className="mb-3 flex items-center justify-between gap-3">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${column.badgeClass}`}
        >
          {column.title}
        </span>

        <span className="text-sm font-semibold text-slate-500">
          {leadsInColumn.length}
        </span>
      </header>

      {leadsInColumn.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 px-3 py-5 text-center text-xs text-slate-400">
          Nenhuma oportunidade
        </p>
      ) : (
        <div className="space-y-3">
          {leadsInColumn.map((lead) => (
            <LeadCard
              isDeleting={isDeletingId === lead._id}
              isUpdating={isUpdatingId === lead._id}
              key={lead._id}
              lead={lead}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function LeadPipeline({
  leads,
  isDeletingId,
  isUpdatingId,
  onDelete,
  onStatusChange,
}: LeadPipelineProps) {
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);

  const totalValue = leads.reduce(
    (total, lead) => total + lead.estimatedValue,
    0,
  );

  const activeColumn = pipelineColumns[activeColumnIndex];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-bold">Pipeline de oportunidades</h3>
          <p className="text-sm text-slate-500">
            {leads.length} oportunidades · {formatCurrency(totalValue)}
          </p>
        </div>

        <Users className="h-5 w-5 text-slate-400" />
      </div>

      <div className="hidden gap-4 p-5 lg:grid lg:grid-cols-3 2xl:grid-cols-5">
        {pipelineColumns.map((column) => (
          <PipelineColumn
            className="min-h-[360px]"
            column={column}
            isDeletingId={isDeletingId}
            isUpdatingId={isUpdatingId}
            key={column.status}
            leads={leads}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>

      <div className="p-4 lg:hidden">
        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            aria-label="Exibir etapa anterior"
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={activeColumnIndex === 0}
            onClick={() =>
              setActiveColumnIndex((currentIndex) => currentIndex - 1)
            }
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>

          <span className="text-xs font-semibold text-slate-500">
            Etapa {activeColumnIndex + 1} de {pipelineColumns.length}
          </span>

          <button
            aria-label="Exibir próxima etapa"
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={activeColumnIndex === pipelineColumns.length - 1}
            onClick={() =>
              setActiveColumnIndex((currentIndex) => currentIndex + 1)
            }
            type="button"
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <PipelineColumn
          column={activeColumn}
          isDeletingId={isDeletingId}
          isUpdatingId={isUpdatingId}
          leads={leads}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      </div>
    </div>
  );
}