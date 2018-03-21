import {Program, run, htmlForMessage} from './elmets';
const html = htmlForMessage<Msg>();

type Msg = Inc | Dec | Rst; 

interface Inc { kind: "Inc" }
interface Dec { kind: "Dec" }
interface Rst { kind: "Rst" }

function update(msg: Msg, model: number): number {
  switch(msg.kind) {
    case "Inc":
      return model + 1;
    case "Dec":
      return model - 1;
    case "Rst":
      return 0;
  }
  throw new Error(`this cannot happen ${msg}`);
};

let inner = html`<button on-click=${ { kind: "Rst" }}>reset</button>`;
let footer = html`<hr><em>${inner}</em>`;
let txt = "answer";

let view = (s: number) => html`<p>
  The ${txt} is <b>${s}</b>
  <button on-click=${ { kind: "Inc" } }>inc</button>
  <button on-click=${ { kind: "Dec" } }>dec</button>
  ${footer}
</p>`;

run(document.getElementById("root"), {
  init: 0,
  update: update,
  view: view,
});
