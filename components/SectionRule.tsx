/** MODIFICATIONS ───────────────────────────── 21 ITEMS */
export function SectionRule({ label, trailing }: { label: string; trailing?: string }) {
  return (
    <div className="section-rule section-rule--trailing">
      <span>{label}</span>
      <span className="rule" />
      {trailing && <span>{trailing}</span>}
    </div>
  );
}
