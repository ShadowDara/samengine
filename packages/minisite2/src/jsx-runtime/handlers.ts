export const handlers = {
  copyTextarea(e: Event) {
    const el = e.target as HTMLTextAreaElement;
    const out = document.getElementById("output");
    if (out) out.textContent = el.value;
  }
};
