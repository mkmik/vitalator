import {Program, run, html} from './tea';

interface Inc { kind: "Inc" }
interface Dec { kind: "Dec" }
interface Foo { kind: "Foo" }

type Msg = Inc | Dec;

function update(msg: Msg, model: number): number {
  switch(msg.kind) {
    case "Inc":
      return model + 1;
    case "Dec":
      return model - 1;
  }
};

let banner = html`<em>ok</em>`;
let txt = "answer";

let view = (s: number) => html`<p>
  The ${txt} is <b>${s}</b>
  <button on-click=${ { kind: "Inc" } }>inc</button>
  <button on-click=${ { kind: "Dec" } }>dec</button>
  ${banner}
</p>`;

let main: Program<Msg, number> = {
  model: 0,
  update: update,
  view: view,
}

run(main, document.getElementById("root"));
