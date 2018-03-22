import {Program, Cmd, none, run, htmlForMessage, onInput, ElementValue} from './elmets';
const html = htmlForMessage<Msg>();

const INC = Symbol("INC");
const DEC = Symbol("DEC");
const RST = Symbol("RST");
const CHANGED = Symbol("CHANGED");

type Msg = Readonly< 
  { kind: typeof INC } |
  { kind: typeof DEC } |
  { kind: typeof RST } |
  { kind: typeof CHANGED} & ElementValue>;

function update(msg: Msg, model: number): number {
  console.log("updating", msg, "(stringified as", JSON.stringify(msg), ")");
  switch(msg.kind) {
    case INC:
      return model + 1;
    case DEC:
      return model - 1;
    case RST:
      return 0;
    case CHANGED:
      return model;
  }
};

let inner = html`<button on-click=${ { kind: RST }}>reset</button>`;
let footer = html`<hr><em>${inner}</em>`;
let txt = "answer";

let view = (s: number) => html`<p>
  The ${txt} is <b>${s}</b>
  <button on-click=${ { kind: INC } }>inc</button>
  <button on-click=${ { kind: DEC } }>dec</button>
  ${footer}
  <hr>
  <input on-change=${ { kind: CHANGED, ...new ElementValue()} }></input>
</p>`;

run(document.getElementById("root"), {
  init: 0,
  update: update,
  view: view,
});
