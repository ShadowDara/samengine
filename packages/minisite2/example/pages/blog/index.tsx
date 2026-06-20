import { h, Fragment } from "minisite/jsx-runtime";
import { Header } from "../../components/Header.js";
import { Link } from "minisite/components/link";

export default function Blog() {
  return (
    <>
      <Header />
      <main>
        <h1>Blog</h1>
        <ul>
          <li>
            <Link to="/blog/first-post">First Post</Link>
          </li>
        </ul>
      </main>
    </>
  );
}
