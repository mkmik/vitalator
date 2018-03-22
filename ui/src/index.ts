import {Program, Cmd, none, run, htmlForMessage, onInput, ElementValue} from './elmets';
const html = htmlForMessage<Msg>();

const INC = Symbol("INC");
const DEC = Symbol("DEC");
const RST = Symbol("RST");
const CHANGED = Symbol("CHANGED");

type Msg = Readonly< 
  { type: typeof INC } |
  { type: typeof DEC } |
  { type: typeof RST } |
  { type: typeof CHANGED} & ElementValue>;

interface Model {
  n: number;
  comment: string;
}

const init: Model = {
  n: 0,
  comment: ""
}

function update(msg: Msg, model: Model): Model {
  console.log("updating", msg, "(stringified as", JSON.stringify(msg), ")");
  switch(msg.type) {
    case INC:
      return {...model, n: model.n + 1};
    case DEC:
      return {...model, n: model.n - 1};
    case RST:
      return init;
    case CHANGED:
      return {...model, comment: msg.value || ""};
  }
};

let inner = html`<button on-click=${ { type: RST }}>reset</button>`;
let footer = html`<hr><em>${inner}</em>`;
let txt = "answer";

let view = (m: Model) => html`<p>
  The ${txt} is <b>${m.n}</b>
  <button on-click=${ { type: INC } }>inc</button>
  <button on-click=${ { type: DEC } }>dec</button>
  ${footer}
  <hr>
  <input on-input=${ { type: CHANGED, ...new ElementValue()} }></input>
  <p>${m.comment}</p>
</p>`;

run(document.getElementById("root"), {
  init: init,
  update: update,
  view: view,
});
