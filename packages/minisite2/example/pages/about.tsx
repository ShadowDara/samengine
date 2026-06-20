import { h, Fragment } from "minisite/jsx-runtime";
import { Header } from "../components/Header.js";

export default function About() {
  return (
    <>
      <Header />
      <main>
        <h1>About</h1>
        <p>MiniSite: TSX rein, eine HTML-Datei raus.</p>
      </main>
    </>
  );
}
