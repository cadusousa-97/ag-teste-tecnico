import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AccessDenied() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-red-600 text-center">
            Acesso Negado
          </CardTitle>
          <CardDescription className="text-center">
            Você não tem permissão para acessar esta página.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
