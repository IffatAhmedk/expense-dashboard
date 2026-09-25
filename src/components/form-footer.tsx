import { btnPrimary } from "./ui";

export function FormFooter({
  error,
  saving,
  label,
  onCancel,
}: {
  error: string | null;
  saving: boolean;
  label: string;
  onCancel: () => void;
}) {
  return (
    <>
      {error && <p className="text-base text-danger">{error}</p>}
      <div className="flex justify-end gap-2 border-t border-line pt-3">
        <button type="button" onClick={onCancel} className="rounded-pill px-4 text-label font-bold text-ink hover:bg-sunken">
          Cancel
        </button>
        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving ? "Saving…" : label}
        </button>
      </div>
    </>
  );
}
