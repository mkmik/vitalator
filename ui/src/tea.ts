import {TemplateResult, TemplateInstance, TemplatePart, Part, getValue} from 'lit-html';
import {render, extendedPartCallback} from 'lit-html/lib/lit-extended';

export {TemplateResult} from 'lit-html';
// export {html} from 'lit-html/lib/lit-extended';

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

export type Value<Msg> = string | number | TemplateResult | Msg;

export function makeTea<Msg>(): (strings: TemplateStringsArray, ...values: Value<Msg>[]) => TemplateResult {
  return html;
}

export function html<Msg>(strings: TemplateStringsArray, ...values: Value<Msg>[]): TemplateResult {
    return new TemplateResult(strings, values, 'html', teaExtendedPartCallback);
}

export const teaExtendedPartCallback =
    (instance: TemplateInstance, templatePart: TemplatePart, node: Node):
        Part => {
          if (templatePart.type === 'attribute') {
            if (templatePart.rawName!.startsWith('on-')) {
              const eventName = templatePart.rawName!.slice(3);
              return new EventPart(instance, node as Element, eventName);
            }
          }
          return extendedPartCallback(instance, templatePart, node);
        };

export class EventPart implements Part {
  instance: TemplateInstance;
  element: Element;
  eventName: string;
  private _listener: any;
  private _previousMsg: any;

  constructor(instance: TemplateInstance, element: Element, eventName: string) {
    this.instance = instance;
    this.element = element;
    this.eventName = eventName;
  }

  setValue(value: any): void {
    const msg = getValue(this, value);
    const previousMsg = this._previousMsg;
    if (msg === previousMsg) {
      return;
    }

    const previousListener = this._listener;
    const listener = () => { console.log("xxx") };
    this._listener = listener;

    if (previousListener != null) {
      this.element.removeEventListener(this.eventName, previousListener);
    }
    if (msg != null) {
      this.element.addEventListener(this.eventName, listener);
    }
  }
}
