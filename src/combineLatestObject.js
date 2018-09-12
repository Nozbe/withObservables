// @flow

import type { Observable } from 'rxjs/Observable'
import { from } from 'rxjs/observable/from'
import { combineLatest } from 'rxjs/observable/combineLatest'
import { map as map$ } from 'rxjs/operators/map'

import zipObj from './zipObj'

type ExtractObservableType = <T>(?Observable<T>) => T

// Transforms an object of Observables into an Observable of an object
// i.e. { a: Observable<number>, b: Observable<string> } -> Observable<{ a: number, b: string }>
export default function combineLatestObject<
  ObjectOfObservables: {
    [key: string]: Observable<*>,
  },
>(object: ObjectOfObservables): Observable<$ObjMap<ObjectOfObservables, ExtractObservableType>> {
  const keys = Object.keys(object)
  const observables = Object.values(object)

  // Optimization: If subscribing just one observable, skip combineLatest
  if (keys.length === 1) {
    const key = keys[0]
    // $FlowFixMe
    return from(observables[0]).pipe(map$(value => ({ [key]: value })))
  }

  // $FlowFixMe
  return combineLatest(observables, (...newValues) => zipObj(keys, newValues))
}
