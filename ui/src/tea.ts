import {TemplateResult, TemplateInstance, TemplatePart, Template, Part, getValue, defaultTemplateFactory} from 'lit-html';
import {render, extendedPartCallback} from 'lit-html/lib/lit-extended';

export interface Program<Msg, Model> {
  model: Model;
  update: (msg: Msg, model: Model) => Model;
  view: (model: Model) => TeaTemplateResult<Msg>;
}

interface TeaTemplate<Msg> {
  __teaUpdate: (msg: Msg) => void | undefined;
}

export function run<Msg, Model>(program: Program<Msg, Model>, mnt: HTMLElement | null): (m: Msg) => void {
  if (mnt === null) {
    throw new Error("bad mount element");
  }

  let update = (msg: Msg) => {
    console.log("calling tea update", msg);
    program.model = program.update(msg, program.model);
    draw();
  }

  let draw = () => {
    let template = program.view(program.model);
    render(template, mnt, (result): Template => {
      let t = defaultTemplateFactory(result);
      (t as any as TeaTemplate<Msg>).__teaUpdate = update; 
      return t;
    });
  };

  draw();
  return update;
}

export type Value<Msg> = string | number | TeaTemplateResult<Msg> | Msg;

export class TeaTemplateResult<Msg> extends TemplateResult {
}

export function htmlForMessage<Msg>(): (strings: TemplateStringsArray, ...values: Value<Msg>[]) => TemplateResult {
  return html;
}

export function html<Msg>(strings: TemplateStringsArray, ...values: Value<Msg>[]): TeaTemplateResult<Msg> {
    return new TeaTemplateResult<Msg>(strings, values, 'html', teaExtendedPartCallback);
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

export class EventPart<Msg> implements Part {
  instance: TemplateInstance;
  element: Element;
  eventName: string;
  private _listener: any;
  private _previousMsg: Msg | undefined;

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
    const listener = () => {
      let u = (this.instance.template as any as TeaTemplate<Msg>);
      if (u.__teaUpdate !== undefined) {
        u.__teaUpdate(msg);
      } else {
        throw new Error("template has no registered TEA updater");
      }
    };
    this._listener = listener;

    if (previousListener != null) {
      this.element.removeEventListener(this.eventName, previousListener);
    }
    if (msg != null) {
      this.element.addEventListener(this.eventName, listener);
    }
  }
}
