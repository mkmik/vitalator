import {Program, Cmd, none, run, htmlForMessage, Html, onInput, ElementValue, repeat} from './elmets';
import "@polymer/paper-button/paper-button.js";
import "@polymer/paper-input/paper-input.js";
import "@polymer/paper-card/paper-card.js";

const html = htmlForMessage<Msg>();


const INC = Symbol("INC");
const DEC = Symbol("DEC");
const RST = Symbol("RST");
const DEL = Symbol("DEL");
const CHANGED = Symbol("CHANGED");

export type Msg = Readonly< 
  { type: typeof INC } |
  { type: typeof DEC } |
  { type: typeof RST } |
  { type: typeof DEL } |
  { type: typeof CHANGED} & ElementValue>;

export interface Model {
  n: number;
  comment: string;
  dead: boolean;
}

export const init: Model = {
  n: 0,
  comment: "",
  dead: false,
}

export function update(msg: Msg, model: Model): Model {
  console.log("Counter.update", msg, "(stringified as", JSON.stringify(msg), ")");
  switch(msg.type) {
    case INC:
      return {...model, n: model.n + 1};
    case DEC:
      return {...model, n: model.n - 1};
    case RST:
      return init;
    case DEL:
      return {...model, dead: true };
    case CHANGED:
      return {...model, comment: msg.value || ""};
  }
  throw new Error(`unhandled message ${((a: never) => a)(msg)}`);
};

let inner = html`
  <paper-button raised on-click=${ { type: RST } }>reset</paper-button>
  <paper-button raised on-click=${ { type: DEL } }>delete</paper-button>
`;

let reset = html`${inner}`;
let txt = "answer";

const actions = html`
  <paper-button raised on-click=${ { type: INC } }>inc</paper-button>
  <paper-button raised on-click=${ { type: DEC } }>dec</paper-button>
  ${reset}
`;

export const view = (m: Model): Html<Msg> => html`
  <paper-card class="counter">
    <div class="card-content">
      The ${txt} is <b>${m.n}</b>
      <paper-input label="comment" on-input=${ { type: CHANGED, ...new ElementValue()} }></paper-input>
      <p>${m.comment}</p>
    </div>
    <div class="card-actions">
      <div class="horizontal justified">
        ${actions}
      </div>
    </div>
  </paper-card>`;

export const sview = (m: Model): Html<Msg> => html`<button on-click=${ { type: RST } }>reset</button><div>${inner}</div>`;
