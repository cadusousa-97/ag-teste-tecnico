"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type ApiError = {
  success: boolean;
  error: string;
  details?: { campo: string; mensagem: string }[];
};

function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === "object" &&
    err !== null &&
    "success" in err &&
    err.success === false &&
    "error" in err
  );
}

export default function ApplyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await api.post("/intencoes", data);

      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: unknown) {
      if (isApiError(err)) {
        if (err.details && err.details.length > 0) {
          setError(err.details[0].mensagem);
        } else {
          setError(err.error);
        }
      } else {
        setError("Ocorreu um erro inesperado. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Obrigado!</CardTitle>
            <CardDescription className="text-center">
              Sua intenção de participação foi enviada com sucesso. Entraremos
              em contato em breve.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader className="flex justify-center flex-col items-center mb-6">
            <CardTitle className="text-3xl">Intenção de Participação</CardTitle>
            <CardDescription className="text-center">
              Preencha o formulário abaixo para analisarmos sua candidatura ao
              grupo de networking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                name="nome"
                placeholder="Seu nome completo"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa (Opcional)</Label>
              <Input
                id="empresa"
                name="empresa"
                placeholder="Nome da sua empresa"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2 mb-4">
              <Label htmlFor="motivo">
                Por que você quer participar? (Opcional)
              </Label>
              <Textarea
                id="motivo"
                name="motivo"
                placeholder="Descreva seus motivos..."
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full cursor-pointer"
            >
              {isLoading ? "Enviando..." : "Enviar candidatura"}
            </Button>

            {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
