import { bodyHtml } from "./site-body.generated";

export const dynamic = "force-static";

export default function Page() {
  return (
    <div
      className="site-root"
      dangerouslySetInnerHTML={{ __html: bodyHtml }}
    />
  );
}
