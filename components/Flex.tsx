/** Text split into letters. The stage swells each one under the cursor. */
export function Flex({ text, className = '' }: { text: string; className?: string }) {
  return (
    <span className={`flex-line ${className}`} data-flex aria-hidden>
      {Array.from(text).map((ch, i) => (
        <span className="ltr-clip" key={i}>
          <span className="ltr" style={{ transitionDelay: `${i * 38}ms` }}>{ch}</span>
        </span>
      ))}
    </span>
  )
}
