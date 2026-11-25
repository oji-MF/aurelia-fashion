import Link from "next/link";

export function InfoPage({
  eyebrow,
  title,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: { heading: string; body: string }[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
      <p className="eyebrow text-accent">{eyebrow}</p>
      <h1 className="mt-4 font-display text-4xl md:text-5xl">{title}</h1>
      <p className="mt-5 text-sm leading-relaxed text-stone">{intro}</p>
      <div className="mt-12 space-y-10">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-2xl">{section.heading}</h2>
            <p className="mt-3 text-sm leading-relaxed text-stone">{section.body}</p>
          </section>
        ))}
      </div>
      <div className="mt-16 border-t border-line/10 pt-8">
        <p className="text-sm text-stone">Still have a question? <Link href="/contact" className="text-accent underline underline-offset-4">Get in touch</Link>.</p>
      </div>
    </div>
  );
}
