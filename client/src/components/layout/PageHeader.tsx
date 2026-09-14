export function PageHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <header className="mb-8 flex flex-col justify-between gap-4 border-b border-line pb-6 sm:flex-row sm:items-end">
      <div><h1 className="text-2xl font-semibold tracking-tight text-copy">{title}</h1><p className="mt-2 max-w-xl text-sm text-muted">{description}</p></div>
      {action}
    </header>
  );
}
