import {Program, Cmd, none, run, htmlForMessage, onInput} from './elmets';
const html = htmlForMessage<Msg>();

type Msg = Msg.Inc | Msg.Dec | Msg.Rst | Msg.Changed;
module Msg {
  export const INC = Symbol("INC");
  export interface Inc { kind: typeof INC }

  export const DEC = Symbol("DEC");
  export interface Dec { kind: typeof DEC }

  export const RST = Symbol("RST");
  export interface Rst { kind: typeof RST }

  export const CHANGED = Symbol("CHANGED");
  export interface Changed { kind: typeof CHANGED, value: string }
  export function Changed(v: string): Changed { return { kind: CHANGED, value: v }; }
}

function update(msg: Msg, model: number): number {
  switch(msg.kind) {
    case Msg.INC:
      return model + 1;
    case Msg.DEC:
      return model - 1;
    case Msg.RST:
      return 0;
    case Msg.CHANGED:
      console.log("changed", msg);
      return model;
  }
};

let inner = html`<button on-click=${ { kind: Msg.RST }}>reset</button>`;
let footer = html`<hr><em>${inner}</em>`;
let txt = "answer";

let view = (s: number) => html`<p>
  The ${txt} is <b>${s}</b>
  <button on-click=${ { kind: Msg.INC } }>inc</button>
  <button on-click=${ { kind: Msg.DEC } }>dec</button>
  ${footer}
  <hr>
  <input on-change=${ onInput(Msg.Changed) }></input>
</p>`;

run(document.getElementById("root"), {
  init: 0,
  update: update,
  view: view,
});
