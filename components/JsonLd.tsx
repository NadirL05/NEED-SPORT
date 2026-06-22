// Server component that injects JSON-LD structured data.
// `<` is escaped to its \u003c unicode form so a string containing `</script>`
// (e.g. admin/CMS-controlled content) cannot break out of the script context.
export default function JsonLd({ data }: { data: object | object[] }) {
  const items = Array.isArray(data) ? data : [data]
  return (
    <>
      {items.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, '\\u003c') }}
        />
      ))}
    </>
  )
}
