import Link from "next/link";
export function Header() {
  return (
    <header className="header">
      <Link className="brand" href="/">
        maison<span>des invitations</span>
      </Link>
      <nav>
        <Link href="/#modeles">Nos collections</Link>
        <Link href="/dashboard">
          Mon espace <span>↗</span>
        </Link>
      </nav>
    </header>
  );
}
