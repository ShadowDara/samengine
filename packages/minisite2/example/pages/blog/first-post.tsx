import { h, Fragment } from "minisite/jsx-runtime";
import { Header } from "../../components/Header.js";

export default function FirstPost() {
  return (
    <>
      <Header />
      <main>
        <h1>First Post</h1>
        <p>
          Das ist der erste Blogpost. Geschrieben in TSX, ausgegeben als HTML.
        </p>
      </main>
    </>
  );
}
