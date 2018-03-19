import {html, render, TemplateResult} from 'lit-html';

const x: number = 42;
const message: string = `Hello ${x} x`;

let foo = (n: Number) => html`<p>The answer is <b>${n}</b></p>`;

function mounted(root: HTMLElement | null): (_:TemplateResult) => void {
  if (root === null) {
    throw new Error("bad root");
  }
  return (t) => render(t, root);
}

let rerender = mounted(document.getElementById("root"));

rerender(foo(42));
for(let i=0; i<100; i++) {
  setTimeout(() => rerender(foo(42+i)), 1000 * i);
}
