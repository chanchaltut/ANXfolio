import Link from "next/link";
import { Arrow } from "@/components/Icons";

export default function NotFound() {
  return (
    <main className="notfound">
      <p className="slate">
        <i /> Error 404
      </p>
      <h1 className="h2">
        This one hit the <em>cutting room floor.</em>
      </h1>
      <Link href="/" className="btn btn--cyan btn--lg">
        Back to the reel <Arrow />
      </Link>
    </main>
  );
}
