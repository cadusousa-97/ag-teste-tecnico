"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/lib/api";

import RegisterForm from "@/components/features/RegisterForm";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPageWrapper() {
  return (
    <Suspense fallback={<LoadingState message="Carregando..." />}>
      <RegisterPage />
    </Suspense>
  );
}

function RegisterPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const swrKey = token ? `/convites/${token}` : null;
  const { data, error, isLoading } = useSWR(swrKey, fetcher);

  if (isLoading || !token) {
    return <LoadingState message="Validando seu convite..." />;
  }

  if (error) {
    return <ErrorState message={error.error} />;
  }

  return <RegisterForm token={token} email={data.data.email} />;
}

const LoadingState = ({ message }: { message: string }) => (
  <div className="flex justify-center items-center min-h-screen bg-gray-100">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">{message}</CardTitle>
      </CardHeader>
    </Card>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="flex justify-center items-center min-h-screen bg-gray-100">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-red-600 text-center">
          Link Inválido
        </CardTitle>
        <CardDescription className="text-center">{message}</CardDescription>
      </CardHeader>
    </Card>
  </div>
);
