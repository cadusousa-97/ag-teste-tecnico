"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DashboardStats = {
  total_membros_ativos: number;
  indicacoes_mes: number;
  agradecimentos_mes: number;
};

export default function DashboardMetrics() {
  const { data, error, isLoading } = useSWR("/dashboard/stats", fetcher);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">Carregando métricas...</div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        Falha ao carregar: {error.error}
      </div>
    );
  }

  const stats: DashboardStats = data.data;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard de Performance</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Membros Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total_membros_ativos}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Indicações (Mês)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.indicacoes_mes}</div>
            <p className="text-xs text-muted-foreground">(Mock)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Agradecimentos (Mês)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.agradecimentos_mes}</div>
            <p className="text-xs text-muted-foreground">(Mock)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
