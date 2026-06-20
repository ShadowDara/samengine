import { h } from "minisite/jsx-runtime";
import { Link } from "minisite/components/link";

export function Header() {
  return (
    <header>
      <strong>MiniSite</strong>
      <nav>
        <Link to="/">Home</Link>
        {" · "}
        <Link to="/about">About</Link>
        {" · "}
        <Link to="/blog">Blog</Link>
      </nav>
    </header>
  );
}
