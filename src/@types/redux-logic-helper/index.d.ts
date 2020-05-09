import { Action } from 'typescript-fsa';
import { ActionCreator } from 'redux';
export type ActionOf<C> = C extends ActionCreator<infer A> ? A : never;
export type Dispatch = (action: AnyAction) => void;
export type PayloadOf<C> = C extends ActionCreator<Action<infer P>> ? P : never;
export type Done = () => void;
