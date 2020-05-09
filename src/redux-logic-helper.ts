import { createLogic as _createLogic, Logic, StandardAction } from 'redux-logic';
import { ActionCreator, isType } from 'typescript-fsa';
import { Dispatch, Done } from 'redux-logic-helper';

type Type = string;
type Object = object | undefined;
export function createLogic<
  State extends object,
  Payload extends Object = undefined,
  Meta extends Object = undefined,
  Dependency extends object = {},
  Context extends Object = undefined,
  Action extends StandardAction<Type, Payload, Meta> = StandardAction<Type, Payload, Meta>,
>(actionCreator: ActionCreator<Payload>, config: {process: any, latest? : boolean}):
Logic<State, any, any, Dependency, Context, Type>
{
  return _createLogic<State, any, any, Dependency, Context, Type, Action>({
    ...config,
    type: actionCreator.type,
    process({action}:{action: any}, dispatch: Dispatch, done: Done){
      if (!isType(action, actionCreator)) throw new TypeError();
      config.process({action}, dispatch, done);
    },
    validate: undefined,
    transform: undefined,
  });
}
