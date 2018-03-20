import {Program, run, html} from './tea';

interface Inc { kind: "Inc" }
interface Dec { kind: "Dec" }
interface Foo { kind: "Foo" }

type Msg = Inc | Dec | Foo;

function update(msg: Msg, model: number): number {
  switch(msg.kind) {
    case "Inc":
      return model + 1;
    case "Dec":
      return model - 1;
    case "Foo":
      return 0;
  }
  throw new Error(`this cannot happen ${msg}`);
};

let inner = html`<button on-click=${ { kind: "Foo" }}>foo</button>`;
let banner = html`<em>${inner}</em>`;
let txt = "answer";

let view = (s: number) => html`<p>
  The ${txt} is <b>${s}</b>
  <button on-click=${ { kind: "Inc" } }>inc</button>
  <button on-click=${ { kind: "Dec" } }>dec</button>
  <button on-click=${ { kind: "Foo" } }>dec</button>
  ${banner}
</p>`;

let main: Program<Msg, number> = {
  model: 0,
  update: update,
  view: view,
}

run(main, document.getElementById("root"));
