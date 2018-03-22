import {Program, Cmd, none, run, htmlForMessage, onInput, ElementValue, repeat} from './elmets';
const html = htmlForMessage<Msg>();

const INC = Symbol("INC");
const DEC = Symbol("DEC");
const RST = Symbol("RST");
const CHANGED = Symbol("CHANGED");

type CounterMsg = Readonly< 
  { type: typeof INC } |
  { type: typeof DEC } |
  { type: typeof RST } |
  { type: typeof CHANGED} & ElementValue>;

interface Counter {
  n: number;
  comment: string;
}

const initCounter: Counter = {
  n: 0,
  comment: "",
}

function updateCounter(msg: CounterMsg, model: Counter): Counter {
  console.log("updating", msg, "(stringified as", JSON.stringify(msg), ")");
  switch(msg.type) {
    case INC:
      return {...model, n: model.n + 1};
    case DEC:
      return {...model, n: model.n - 1};
    case RST:
      return initCounter;
    case CHANGED:
      return {...model, comment: msg.value || ""};
  }
};

const ADD = Symbol("ADD");
const COUNTER_MSG = Symbol("COUNTER_MSG");

type Msg = Readonly< 
  { type: typeof ADD }|
  { type: typeof COUNTER_MSG, msg: CounterMsg, pos: number }>

interface Model {
  counters: Counter[],
}

const init: Model = {
  counters: [initCounter],
}

function update(msg: Msg, model: Model): Model {
  console.log("updating", msg, "(stringified as", JSON.stringify(msg), ")");
  switch(msg.type) {
    case ADD:
      return {...model, counters: [...model.counters, initCounter]};
    case COUNTER_MSG:
      return {...model, counters: model.counters.map( (item, index) => {
        if (index !== msg.pos) {
          return item;
        }
        return updateCounter(msg.msg, item);
      })};
  }
};

// this is hardcoding the position but we want to solve it in a better way
let inner = html`<button on-click=${ { type: COUNTER_MSG, msg: { type: RST }, pos: 0} }>reset</button>`;
let footer = html`<hr><em>${inner}</em>`;
let txt = "answer";

let counterView = (m: Counter, pos: number) => html`<p>
  The ${txt} is <b>${m.n}</b>
  <button on-click=${ { type: COUNTER_MSG, msg: { type: INC }, pos: pos } }>inc</button>
  <button on-click=${ { type: COUNTER_MSG, msg: { type: DEC }, pos: pos } }>dec</button>
  ${footer}
  <hr>
  <input on-input=${ { type: COUNTER_MSG, msg: { type: CHANGED, ...new ElementValue()}, pos: pos } }></input>
  <p>${m.comment}</p>
</p>`;

let view = (m: Model) => html`
  <button on-click=${ { type: ADD } }>Add counter</button>
  <hr>
  <ul>
  ${m.counters.map(counterView)}
  </ul>`;

run(document.getElementById("root"), {
  init: init,
  update: update,
  view: view,
});
