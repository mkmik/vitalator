import {Program, Cmd, none, run, htmlForMessage, Html, onInput, ElementValue, repeat} from './elmets';
import * as Counter from  './counter';
const html = htmlForMessage<Msg>();

const ADD = Symbol("ADD");
const COUNTER_MSG = Symbol("COUNTER_MSG");

type Msg = Readonly< 
  { type: typeof ADD }|
  { type: typeof COUNTER_MSG, msg: Counter.Msg, pos: number }>

interface Model {
  counters: Counter.Model[],
}

const init: Model = {
  counters: [Counter.init],
}

function update(msg: Msg, model: Model): Model {
  console.log("Main.update", msg, "(stringified as", JSON.stringify(msg), ")");
  switch(msg.type) {
    case ADD:
      return {...model, counters: [...model.counters, Counter.init]};
    case COUNTER_MSG:
      return {...model, counters: model.counters.map( (item, index) => {
        if (index !== msg.pos) {
          return item;
        }
        return Counter.update(msg.msg, item);
      })};
  }
  throw new Error("unhandled message");
};

let view = (m: Model):Html<Msg> => html`
  <button on-click=${ { type: ADD } }>Add counter</button>
  <hr>
  <ul>
  ${m.counters.map(Counter.view).map((h, index) => Html.map<Counter.Msg, Msg>(h, (msg) => ({ type: COUNTER_MSG, pos: index, msg: msg})))}
  </ul>`;

let sview = (m: Model): Html<Msg> => html`<p>${Html.map<Counter.Msg, Msg>(Counter.view(m.counters[0]), (msg) => ({ type: COUNTER_MSG, pos: 0, msg: msg}))}</p>`;

run(document.getElementById("root"), {
  init: init,
  update: update,
  view: view,
});
