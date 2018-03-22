import {TemplateResult, TemplateInstance, DirectiveFn, TemplatePart, Template, Part, getValue, defaultTemplateFactory} from 'lit-html';
import {render, extendedPartCallback} from 'lit-html/lib/lit-extended';
export {repeat} from 'lit-html/lib/repeat';

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
  update: (msg: Msg, model: Model) => ModelAndCmd<Model, Msg>;
  /*
   * Draw a model.
   */
  view: (model: Model) => Html<Msg>;
}

type ModelAndCmd<Model, Msg> = Model | [Model, Cmd<Msg>];

function unwrapModelAndCmd<Model, Msg>(m: ModelAndCmd<Model, Msg>): [Model, Cmd<Msg>] {
    if (m instanceof Array) {
      return m;
    } else {
      return [m, new None<Msg>()];
    }
}

export interface Cmd<Msg> {
  perform(f: (msg: Msg) => void): void;
}

class None<Msg> implements Cmd<Msg> {
  perform(f: (msg: Msg) => void): void {
  }
}

export const none = <Msg>() => new None<Msg>();

interface ElmetsTemplate<Msg> {
  __elmetsUpdate: (msg: Msg) => void;
}

export function run<Msg, Model>(mnt: HTMLElement | null, program: Program<Msg, Model>): (m: Msg) => void {
  if (mnt === null) {
    throw new Error("bad mount element");
  }

  let model = program.init;

  let update = (msg: Msg) => {
    let cmd: Cmd<Msg>;
    [model, cmd] = unwrapModelAndCmd(program.update(msg, model));
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

export interface EventHandler<Msg> {
  eventToMessage(e: Event): Msg
}

function isEventHandler<Msg>(object: any): object is EventHandler<Msg> {
    return 'eventToMessage' in object;
}

export type Value<Msg> = 
  string |
  string[] |
  number |
  number[] |
  Html<Msg> |
  Html<Msg>[] |
  Msg |
  EventHandler<Msg> |
  DirectiveFn<Part>;

export class Html<Msg> extends TemplateResult {
  private foo?: Msg; // force the type-checker to distinguish Html objects of different type parameters.

  static map<A, Msg>(h: Html<A>, f: (from: A) => Msg): Html<Msg> {
    console.log("should map recursively from", h);

    const patch = (h: Html<A>) => {
      if ((h.partCallback as any).__elmetsExtended === true) {
        h.partCallback = (instance: TemplateInstance, templatePart: TemplatePart, node: Node): Part => {
          return elmetsExtendedPartCallback(instance, templatePart, node, f);
        };
        (h.partCallback as any).__elmetsExtended = true;
      }

      for (let v of h.values) {
        if (v instanceof Html) {
          patch(v);
        }
      }
    };

    patch(h);

    return h as any as Html<Msg>;
  }
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
    <Msg>(instance: TemplateInstance, templatePart: TemplatePart, node: Node,
      messageMapper: MessageMapper<any, Msg> = (msg: any) => (msg as Msg)):
        Part => {
          if (templatePart.type === 'attribute') {
            if (templatePart.rawName!.startsWith('on-')) {
              const eventName = templatePart.rawName!.slice(3);
              return new EventPart(instance, node as Element, eventName, messageMapper);
            }
          }
          return extendedPartCallback(instance, templatePart, node);
        };

// TODO(mkm): use hybrid types.
(elmetsExtendedPartCallback as any).__elmetsExtended = true;

type MessageMapper<A, Msg> = (msg: A) => Msg;

export class EventPart<Msg> implements Part {
  instance: TemplateInstance;
  element: Element;
  eventName: string;
  messageMapper: MessageMapper<any, Msg>;
  private _listener: any;
  private _previousMsg?: Msg;

  constructor(instance: TemplateInstance, element: Element, eventName: string, messageMapper: MessageMapper<any, Msg>) {
    this.instance = instance;
    this.element = element;
    this.eventName = eventName;
    this.messageMapper = messageMapper; 
  }

  setValue(value: any): void {
    let msg = getValue(this, value) as Value<Msg>;
    const previousMsg = this._previousMsg;
    if (msg === previousMsg) {
      return;
    }

    const previousListener = this._listener;
    const listener = (e: Event) => {
      let u = (this.instance.template as any as ElmetsTemplate<Msg>);
      if (u.__elmetsUpdate !== undefined) {
        if (isEventHandler(msg)) {
          msg = msg.eventToMessage(e);
        } else if (isElementValue(msg)) {
          msg = {value: (e.target as any).value, ...(msg as any)} as Msg;
        }
        u.__elmetsUpdate(this.messageMapper(msg));
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

/**
 * onInput takes the value of an input element and passes it to a custom message constructor.
 */
export function onInput<Msg extends {}>(msg: Msg&ElementValue): EventHandler<Msg> {
  return {
    eventToMessage: (e: Event): Msg => ({...(msg as any), value: (e.target as HTMLInputElement).value} as Msg&ElementValue),
  };
}

const VALUER = Symbol("VALUER");
export class ElementValue {
  valuerKind = VALUER
  value?: string
}

function isElementValue(object: any): object is ElementValue {
    return object.valuerKind == VALUER;
}
