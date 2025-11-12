"use client";

import useSWR, { mutate } from "swr";
import { fetcher, api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from "react";

type Intencao = {
  id: string;
  nome: string;
  email: string;
  empresa: string;
  status: "pendente" | "aprovada" | "rejeitada";
};

export default function AdminDashboard() {
  const { data, error, isLoading } = useSWR("/intencoes", fetcher);

  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const handleUpdateStatus = async (
    id: string,
    status: "aprovada" | "rejeitada"
  ) => {
    setIsUpdating(id);
    try {
      const response = await api.patch(`/intencoes/${id}`, { status });

      if (response.success && response.data.convite) {
        const token = response.data.convite.token;
        const link = `http://localhost:3000/register?token=${token}`;
        setGeneratedLink(link);
      }

      mutate("/intencoes");
    } catch (err) {
      console.error("Falha ao atualizar status", err);
      alert("Falha ao atualizar status.");
    } finally {
      setIsUpdating(null);
    }
  };

  if (isLoading) return <div className="p-10">Carregando candidaturas...</div>;
  if (error)
    return <div className="p-10">Falha ao carregar: {error.error}</div>;

  const intencoes: Intencao[] = data.data || [];

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Área do Administrador</h1>

      {generatedLink && (
        <Alert variant="default" className="mb-6 bg-blue-50 border-blue-200">
          <AlertTitle className="text-blue-800">Convite gerado!</AlertTitle>
          <AlertDescription className="text-blue-700">
            Clique no link abaixo para cadastrar o membro aprovado:
            <br />
            <a
              href={generatedLink}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline break-all"
            >
              {generatedLink}
            </a>
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Candidaturas Recebidas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {intencoes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Nenhuma candidatura recebida.
                  </TableCell>
                </TableRow>
              )}
              {intencoes.map((intencao) => (
                <TableRow key={intencao.id}>
                  <TableCell className="font-medium">{intencao.nome}</TableCell>
                  <TableCell>{intencao.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        intencao.status === "pendente"
                          ? "outline"
                          : intencao.status === "aprovada"
                          ? "default"
                          : "destructive"
                      }
                      className={
                        intencao.status === "aprovada"
                          ? "bg-blue-600 text-white"
                          : ""
                      }
                    >
                      {intencao.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {intencao.status === "pendente" && (
                      <>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(intencao.id, "rejeitada")
                          }
                          disabled={isUpdating === intencao.id}
                        >
                          Rejeitar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(intencao.id, "aprovada")
                          }
                          disabled={isUpdating === intencao.id}
                        >
                          {isUpdating === intencao.id
                            ? "Aprovando..."
                            : "Aprovar"}
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
