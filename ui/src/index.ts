import {Program, TemplateResult, run, html} from './tea';

interface Inc { kind: "Inc" }
interface Dec { kind: "Dec" }

type Msg = Inc | Dec;

function update(msg: Msg, model: number): number {
  switch(msg.kind) {
    case "Inc":
      return model + 1;
    case "Dec":
      return model - 1;
  }
}

let view = (s: number) => html`<p>
  The answer is <b>${s}</b>
  <button on-click=${() => act({ kind: "Inc" }) }>inc</button>
  <button on-click=${() => act({ kind: "Dec" }) }>Dec</button>
</p>`;

let main: Program<Msg, number> = {
  model: 0,
  update: update,
  view: view,
}

let act = run(main, document.getElementById("root"));
