import {TemplateResult} from 'lit-html';
import {render} from 'lit-html/lib/lit-extended';

export {TemplateResult} from 'lit-html';
export {html} from 'lit-html/lib/lit-extended';

export interface Program<Msg, Model> {
  model: Model;
  update: (msg: Msg, model: Model) => Model;
  view: (model: Model) => TemplateResult;
}

export function run<Msg, Model>(program: Program<Msg, Model>, mnt: HTMLElement | null): (m: Msg) => void {
  if (mnt === null) {
    throw new Error("bad mount element");
  }
  let u = (msg: Msg) => {
    program.model = program.update(msg, program.model);
    render(program.view(program.model), mnt);
  }
  render(program.view(program.model), mnt);
  return u;
}

