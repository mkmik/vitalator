import {Program, Cmd, none, run, htmlForMessage, onInput, ElementValue, repeat} from './elmets';
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
  console.log("updating", msg, "(stringified as", JSON.stringify(msg), ")");
  console.log("type is ", msg.type, "equals to COUNTER_MSG?", msg.type === COUNTER_MSG);
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

let view = (m: Model) => html`
  <button on-click=${ { type: ADD } }>Add counter</button>
  <hr>
  <ul>
  ${m.counters.map(Counter.view)}
  </ul>`;

run(document.getElementById("root"), {
  init: init,
  update: update,
  view: view,
});
