"use client";
import { deleteInvitation } from "@/app/actions";
export function DeleteInvitation({ id }: { id: string }) {
  return (
    <form
      action={deleteInvitation}
      onSubmit={(e) => {
        if (
          !confirm(
            "Supprimer définitivement cette invitation et toutes ses réponses ?",
          )
        )
          e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="danger">Supprimer l’invitation et ses réponses</button>
    </form>
  );
}
