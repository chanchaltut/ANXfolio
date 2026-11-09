/** Small labelled inputs so admin forms stay consistent. Server components. */
export function Field({
  label,
  hint,
  wide,
  children,
}: {
  label: string;
  hint?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`a-field${wide ? " a-field--wide" : ""}`}>
      <span className="a-field__label">{label}</span>
      {children}
      {hint && <span className="a-field__hint">{hint}</span>}
    </label>
  );
}

export function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="a-check">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} />
      <span>{label}</span>
    </label>
  );
}

export function PageHead({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <header className="a-head">
      <h1>{title}</h1>
      {children && <div className="a-head__aside">{children}</div>}
    </header>
  );
}
