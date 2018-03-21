import {TemplateResult, TemplateInstance, TemplatePart, Template, Part, getValue, defaultTemplateFactory} from 'lit-html';
import {render, extendedPartCallback} from 'lit-html/lib/lit-extended';

/**
 * A program describes how to manage a Elmets app.
 *
 * Honestly, it is totally normal if this seems crazy at first.
 * The best way to understand is to work through guide.elm-lang.org. It makes way more sense in context!
 *
 * @param Msg the type of the messages this program will use.
 * @param Model the type of the state this program holds.
 */
export interface Program<Msg, Model> {
  /**
   * Initial program's state.
   */
  init: Model;
  /*
   * Compute a new model state upon reception of a message.
   */
  update: (msg: Msg, model: Model) => Model;
  /*
   * Draw a model.
   */
  view: (model: Model) => Html<Msg>;
}

interface ElmetsTemplate<Msg> {
  __elmetsUpdate: (msg: Msg) => void | undefined;
}

export function run<Msg, Model>(mnt: HTMLElement | null, program: Program<Msg, Model>): (m: Msg) => void {
  if (mnt === null) {
    throw new Error("bad mount element");
  }

  let model = program.init;

  let update = (msg: Msg) => {
    model = program.update(msg, model);
    draw();
  }

  let draw = () => {
    let template = program.view(model);
    render(template, mnt, (result): Template => {
      let t = defaultTemplateFactory(result);
      (t as any as ElmetsTemplate<Msg>).__elmetsUpdate = update; 
      return t;
    });
  };

  draw();
  return update;
}

export type Value<Msg> = string | number | Html<Msg> | Msg;

export class Html<Msg> extends TemplateResult {
}

export function htmlForMessage<Msg>(): (strings: TemplateStringsArray, ...values: Value<Msg>[]) => TemplateResult {
  return html;
}

/**
 * html is a tagged template function that builds Html template objects that
 * emits messages of a given user defined type on events.
 */
export function html<Msg>(strings: TemplateStringsArray, ...values: Value<Msg>[]): Html<Msg> {
    return new Html<Msg>(strings, values, 'html', elmetsExtendedPartCallback);
}

export const elmetsExtendedPartCallback =
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
      let u = (this.instance.template as any as ElmetsTemplate<Msg>);
      if (u.__elmetsUpdate !== undefined) {
        u.__elmetsUpdate(msg);
      } else {
        throw new Error("template has no registered elmets updater");
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
