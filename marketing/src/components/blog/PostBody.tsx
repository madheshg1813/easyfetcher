import { PortableText, type PortableTextComponents } from "next-sanity";
import { headingId, type PortableBlock } from "@/lib/blog";

function blockText(value: unknown): string {
  const children = (value as { children?: { text?: string }[] }).children ?? [];
  return children.map((c) => c.text ?? "").join("");
}

interface TableRow {
  _key: string;
  header?: boolean;
  cells: string[];
}

const components: PortableTextComponents = {
  types: {
    table: ({ value }: { value: { rows?: TableRow[] } }) => {
      const rows = value.rows ?? [];
      if (rows.length === 0) return null;
      const [head, ...body] = rows;
      return (
        <div className="my-7 overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm border-collapse">
            {head?.header && (
              <thead>
                <tr className="bg-gray-50">
                  {head.cells.map((c, i) => (
                    <th key={i} className="text-left font-bold text-gray-900 px-4 py-3 border-b border-gray-200">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {(head?.header ? body : rows).map((row) => (
                <tr key={row._key} className="even:bg-gray-50/50">
                  {row.cells.map((c, i) => (
                    <td key={i} className="px-4 py-3 border-b border-gray-100 text-gray-600 align-top">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    },
  },
  block: {
    normal: ({ children }) => <p className="text-gray-600 leading-[1.8] mb-5">{children}</p>,
    h2: ({ value, children }) => (
      <h2 id={headingId(blockText(value))} className="scroll-mt-28 text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-12 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight mt-8 mb-3">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-amber-400 bg-amber-50/60 rounded-r-lg pl-5 pr-4 py-3 my-6 text-gray-700 italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-6 space-y-2 mb-6 text-gray-600 leading-relaxed marker:text-amber-400">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-6 space-y-2 mb-6 text-gray-600 leading-relaxed marker:text-gray-400 marker:font-semibold">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed pl-1">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed pl-1">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200 text-[0.85em] font-mono text-[#1c3050]">{children}</code>
    ),
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target={value?.href?.startsWith("http") ? "_blank" : undefined}
        rel="noopener noreferrer"
        className="text-blue-600 font-medium no-underline hover:text-blue-700 transition-colors"
      >
        {children}
      </a>
    ),
  },
};

export default function PostBody({ body }: { body?: PortableBlock[] }) {
  if (!body) return null;
  return (
    <div className="text-[17px]">
      <PortableText value={body} components={components} />
    </div>
  );
}
