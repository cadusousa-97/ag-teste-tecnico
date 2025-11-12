import AdminDashboard from "@/components/features/AdminDashboard";
import AccessDenied from "@/components/features/AccessDenied";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function AdminPage(props: AdminPageProps) {
  const searchParams = await props.searchParams;
  const secretFromUrl = Array.isArray(searchParams.secret)
    ? searchParams.secret[0]
    : searchParams.secret;
  const secretFromEnv = process.env.ADMIN_SECRET;

  console.log("--- DEPURAÇÃO ADMIN ---");
  console.log("Segredo da URL:", secretFromUrl);
  console.log("Segredo do Ambiente (ENV):", secretFromEnv);

  if (!secretFromEnv) {
    console.error("ADMIN_SECRET não está definido no ambiente.");
    return <AccessDenied />;
  }

  if (secretFromUrl !== secretFromEnv) {
    return <AccessDenied />;
  }

  return <AdminDashboard />;
}
