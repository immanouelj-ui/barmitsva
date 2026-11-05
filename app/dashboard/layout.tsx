import Link from "next/link";
import { Header } from "@/components/header";
import { requireUser } from "@/lib/auth";
import { logout } from "@/app/actions";
export const dynamic = "force-dynamic";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireUser();
  return (
    <>
      <Header />
      <div className="dashboard-nav">
        <Link href="/dashboard">Mes invitations</Link>
        <span>{user.email}</span>
        <form action={logout}>
          <button className="text-link">Se déconnecter</button>
        </form>
      </div>
      {children}
    </>
  );
}
