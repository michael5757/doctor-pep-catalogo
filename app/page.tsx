import { bodyHtml } from "./site-body.generated";

export default function Page() {
  return (
    <div
      className="site-root"
      dangerouslySetInnerHTML={{ __html: bodyHtml }}
    />
  );
}
