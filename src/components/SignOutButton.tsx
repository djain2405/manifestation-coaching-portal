import { logoutAction } from "@/app/login/actions";

export function SignOutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded-full border border-border/80 bg-surface/80 px-4 py-1.5 text-sm font-medium text-muted transition-colors hover:border-accent/50 hover:text-foreground"
      >
        Sign out
      </button>
    </form>
  );
}
