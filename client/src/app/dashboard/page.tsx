import AccessDenied from "@/components/features/AccessDenied";
import DashboardMetrics from "@/components/features/DashboardMetrics";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function DashboardPage(props: DashboardPageProps) {
  const searchParams = await props.searchParams;
  const secretFromUrl = Array.isArray(searchParams.secret)
    ? searchParams.secret[0]
    : searchParams.secret;
  const secretFromEnv = process.env.ADMIN_SECRET;

  if (!secretFromEnv || secretFromUrl !== secretFromEnv) {
    return <AccessDenied />;
  }

  return <DashboardMetrics />;
}
