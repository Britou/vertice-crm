"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Building2, LoaderCircle, Plus, Search, X } from "lucide-react";
import { LeadPipeline } from "@/components/LeadPipeline";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "@/lib/api";
import {
  leadSources,
  leadStatuses,
  type CreateLeadInput,
  type Lead,
  type LeadSource,
  type LeadStatus,
} from "@/types/lead";

const leadFormSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do contato."),
  company: z.string().trim().min(2, "Informe a empresa."),
  email: z.union([z.email("Informe um e-mail válido."), z.literal("")]),
  phone: z.string().trim(),
  source: z.enum(leadSources),
  estimatedValue: z.number().nonnegative("O valor não pode ser negativo."),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

const statusLabels: Record<LeadStatus, string> = {
  NOVO: "Novo",
  CONTATO: "Em contato",
  PROPOSTA: "Proposta",
  GANHO: "Ganho",
  PERDIDO: "Perdido",
};

const sourceLabels: Record<LeadSource, string> = {
  SITE: "Site",
  INDICACAO: "Indicação",
  INSTAGRAM: "Instagram",
  OUTRO: "Outro",
};

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? "Não foi possível concluir a ação.";
  }

  return "Ocorreu um erro inesperado.";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function Home() {
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [requestError, setRequestError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "TODOS">(
    "TODOS",
  );

  const {
    data: leads = [],
    isLoading,
    error: loadError,
    refetch,
  } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const response = await api.get<Lead[]>("/api/leads");
      return response.data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      source: "OUTRO",
      estimatedValue: 0,
    },
  });

  const metrics = useMemo(() => {
    const inProposal = leads.filter((lead) => lead.status === "PROPOSTA");
    const activeValue = leads
      .filter(
        (lead) => lead.status !== "GANHO" && lead.status !== "PERDIDO",
      )
      .reduce((total, lead) => total + lead.estimatedValue, 0);

    return {
      total: leads.length,
      proposals: inProposal.length,
      activeValue,
    };
  }, [leads]);

  const filteredLeads = useMemo(() => {
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase("pt-BR");

  return leads.filter((lead) => {
    const matchesSearch =
      !normalizedSearch ||
      [lead.name, lead.company, lead.email ?? "", lead.phone ?? ""].some(
        (value) =>
          value.toLocaleLowerCase("pt-BR").includes(normalizedSearch),
      );

    const matchesStatus =
      statusFilter === "TODOS" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
}, [leads, searchTerm, statusFilter]);

  const visibleError =
  requestError || (loadError ? getErrorMessage(loadError) : "");

  async function onSubmit(data: LeadFormData) {
    try {
      setRequestError("");

      const payload: CreateLeadInput = {
        ...data,
        email: data.email || undefined,
        phone: data.phone || undefined,
      };

      await api.post<Lead>("/api/leads", payload);
      await refetch();
      reset();
    } catch (error) {
      setRequestError(getErrorMessage(error));
    }
  }

  async function updateLeadStatus(id: string, status: LeadStatus) {
    try {
      setRequestError("");
      setIsUpdatingId(id);

      await api.patch<Lead>(`/api/leads/${id}`, { status });
      await refetch();
    } catch (error) {
      setRequestError(getErrorMessage(error));
    } finally {
      setIsUpdatingId(null);
    }
  }

  async function deleteLead(id: string) {
    const shouldDelete = window.confirm(
      "Deseja excluir este lead permanentemente?",
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setRequestError("");
      setIsDeletingId(id);

      await api.delete(`/api/leads/${id}`);
      await refetch();
    } catch (error) {
      setRequestError(getErrorMessage(error));
    } finally {
      setIsDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-600 font-bold text-white">
              V
            </span>
            <div>
              <p className="text-lg font-bold tracking-tight">Vértice</p>
              <p className="text-sm text-slate-500">CRM de relacionamentos</p>
            </div>
          </div>

          <span className="rounded-full bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-700">
            Leads
          </span>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-semibold text-violet-700">
              Novo relacionamento
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              Cadastre um lead
            </h1>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Field label="Nome" error={errors.name?.message}>
              <input
                className="input"
                placeholder="Ex.: Mariana Costa"
                {...register("name")}
              />
            </Field>

            <Field label="Empresa" error={errors.company?.message}>
              <input
                className="input"
                placeholder="Ex.: Orla Studio"
                {...register("company")}
              />
            </Field>

            <Field label="E-mail" error={errors.email?.message}>
              <input
                className="input"
                placeholder="contato@empresa.com"
                type="email"
                {...register("email")}
              />
            </Field>

            <Field label="Telefone">
              <input
                className="input"
                placeholder="(00) 00000-0000"
                {...register("phone")}
              />
            </Field>

            <Field label="Origem">
              <select className="input" {...register("source")}>
                {leadSources.map((source) => (
                  <option key={source} value={source}>
                    {sourceLabels[source]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Valor estimado" error={errors.estimatedValue?.message}>
              <input
                className="input"
                min="0"
                step="0.01"
                type="number"
                {...register("estimatedValue", { valueAsNumber: true })}
              />
            </Field>

            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
              Adicionar lead
            </button>
          </form>
        </aside>

        <section className="min-w-0">
          <div className="mb-8">
            <p className="text-sm font-semibold text-violet-700">Visão geral</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight">
              Acompanhe suas oportunidades
            </h2>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Metric label="Leads cadastrados" value={String(metrics.total)} />
            <Metric label="Em proposta" value={String(metrics.proposals)} />
            <Metric
              label="Valor em negociação"
              value={formatCurrency(metrics.activeValue)}
            />
          </div>

          {visibleError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {visibleError}
            </div>
          )}

          <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_190px]">
            <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 shadow-sm focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-100">
              <Search className="h-5 w-5 shrink-0 text-slate-400" />
              <input
                aria-label="Buscar leads"
                className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por nome, empresa, e-mail ou telefone"
                value={searchTerm}
              />
              {searchTerm && (
                <button
                  aria-label="Limpar busca"
                  className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  onClick={() => setSearchTerm("")}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <select
              aria-label="Filtrar por status"
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium shadow-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              onChange={(event) =>
                setStatusFilter(event.target.value as LeadStatus | "TODOS")
              }
              value={statusFilter}
            >
              <option value="TODOS">Todos os status</option>
              {leadStatuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </div>

                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-12 text-slate-500 shadow-sm">
                        <LoaderCircle className="h-5 w-5 animate-spin" />
                        Carregando leads...
                      </div>
                    ) : leads.length === 0 ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                        <Building2 className="mx-auto h-10 w-10 text-slate-300" />
                        <h4 className="mt-4 font-bold">Nenhum lead cadastrado</h4>
                        <p className="mt-1 text-sm text-slate-500">
                          Use o formulário para registrar a primeira oportunidade.
                        </p>
                      </div>
                    ) : filteredLeads.length === 0 ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                        <Search className="mx-auto h-10 w-10 text-slate-300" />
                        <h4 className="mt-4 font-bold">Nenhum resultado encontrado</h4>
                        <p className="mt-1 text-sm text-slate-500">
                          Ajuste a busca ou selecione outro status.
                        </p>
                      </div>
                    ) : (
                      <LeadPipeline
                        isDeletingId={isDeletingId}
                        isUpdatingId={isUpdatingId}
                        leads={filteredLeads}
                        onDelete={(id) => void deleteLead(id)}
                        onStatusChange={(id, status) =>
                          void updateLeadStatus(id, status)
                        }
                      />
                    )}
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
    </article>
  );
}