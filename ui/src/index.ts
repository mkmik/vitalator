import {Program, run, htmlForMessage, onInput} from './elmets';
const html = htmlForMessage<Msg>();

type Msg = Inc | Dec | Rst | Changed; 

interface Inc { kind: "Inc"}
interface Dec { kind: "Dec" }
interface Rst { kind: "Rst" }
interface Changed { kind: "Changed", value: string }
function Changed(v: string): Changed { return { kind: "Changed", value: v }; }

function update(msg: Msg, model: number): number {
  switch(msg.kind) {
    case "Inc":
      return model + 1;
    case "Dec":
      return model - 1;
    case "Rst":
      return 0;
    case "Changed":
      console.log("changed", msg);
      return model;
  }
};

let inner = html`<button on-click=${ { kind: "Rst" }}>reset</button>`;
let footer = html`<hr><em>${inner}</em>`;
let txt = "answer";

let view = (s: number) => html`<p>
  The ${txt} is <b>${s}</b>
  <button on-click=${ { kind: "Inc" } }>inc</button>
  <button on-click=${ { kind: "Dec" } }>dec</button>
  ${footer}
  <hr>
  <input on-change=${ onInput(Changed) }></input>
</p>`;

run(document.getElementById("root"), {
  init: 0,
  update: update,
  view: view,
});
