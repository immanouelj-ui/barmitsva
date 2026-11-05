import { Editor } from "@/components/editor";
import { templates } from "@/lib/models";
export default async function New({
  searchParams,
}: {
  searchParams: Promise<{ modele?: string }>;
}) {
  const { modele } = await searchParams;
  const theme = templates.find((t) => t.id === modele)?.id || "azure";
  return (
    <main className="workspace narrow">
      <span className="eyebrow">VOTRE FAIRE-PART</span>
      <h1>
        Écrivons <i>votre invitation.</i>
      </h1>
      <p className="muted">Quelques détails pour donner vie à votre carte.</p>
      <Editor theme={theme} />
    </main>
  );
}
