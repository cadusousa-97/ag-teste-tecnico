"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type RegisterFormProps = {
  token: string;
  email: string;
};

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
    "error" in err
  );
}

export default function RegisterForm({ token, email }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const payload = {
      ...data,
      token: token,
    };

    try {
      await api.post("/usuarios", payload);
      setSuccess(true);
    } catch (err: unknown) {
      if (isApiError(err)) {
        setError(err.details ? err.details[0].mensagem : err.error);
      } else {
        setError("Ocorreu um erro inesperado.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Cadastro Concluído!
            </CardTitle>
            <CardDescription className="text-center">
              Seja bem-vindo(a)! Você já pode acessar a plataforma.
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
          <CardHeader>
            <CardTitle className="text-3xl text-center">
              Cadastro Completo
            </CardTitle>
            <CardDescription className="mt-2">
              Falta pouco! Complete seus dados para finalizar o cadastro.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="mt-1">
                *Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                disabled
              />
            </div>
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
              <Label htmlFor="empresa">Empresa (Opcional)</Label>
              <Input
                id="empresa"
                name="empresa"
                placeholder="Nome da sua empresa"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Crie uma Senha *</Label>
              <Input
                id="senha"
                name="senha"
                type="password"
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start">
            <Button type="submit" disabled={isLoading} className="w-full mt-4">
              {isLoading ? "Finalizando..." : "Finalizar Cadastro"}
            </Button>
            {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
