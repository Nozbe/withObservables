// @flow
/* eslint-disable no-console */
/* eslint-disable react/sort-comp */

import type { Observable, Subscription } from 'rxjs'
import { Component, createElement } from 'react'
import hoistNonReactStatic from 'hoist-non-react-statics'

import combineLatestObject from './combineLatestObject'
import mapObject from './mapObject'

type UnaryFn<A, R> = (a: A) => R
type HOC<Base, Enhanced> = UnaryFn<React$ComponentType<Base>, React$ComponentType<Enhanced>>

type ObservableConvertible<T> = { +observe: () => Observable<T> }

type ExtractTypeFromObservable = <T>(value: Observable<T> | ObservableConvertible<T>) => T

type TriggerProps<A> = $Keys<A>[] | null
type GetObservables<A, B> = (props: A) => B

type WithObservablesSynchronized<Props, ObservableProps> = HOC<{ ...$Exact<Props>, ...$ObjMap<ObservableProps, ExtractTypeFromObservable> },
  Props,>

const toObservable = (value: any): Observable<any> =>
  typeof value.observe === 'function' ? value.observe() : value

const identicalArrays = <T, V: T[]>(arrayA: V, arrayB: V): boolean =>
  arrayA.length === arrayB.length && arrayA.every((el, index) => el === arrayB[index])

const makeGetNewProps: <A: {}, B: {}>(
  GetObservables<A, B>,
) => A => Observable<*> = getObservables => props => {
  // $FlowFixMe
  const rawObservables = getObservables(props)
  const observables = mapObject(toObservable, rawObservables)
  return combineLatestObject(observables)
}

function getTriggeringProps<PropsInput: {}>(
  props: PropsInput,
  propNames: TriggerProps<PropsInput>,
): any[] {
  if (!propNames) {
    return []
  }

  return propNames.map(name => props[name])
}

const prefetchTimeout = 2000 // ms

// Injects new props to a component with values from the passed Observables
//
// Every time one of the `triggerProps` changes, `getObservables()` is called
// and the returned Observables are subscribed to.
//
// Every time one of the Observables emits a new value, the matching inner prop is updated.
//
// You can return multiple Observables in the function. You can also return arbitrary objects that have
// an `observe()` function that returns an Observable.
//
// The inner component will not render until all supplied Observables return their first values.
// If `triggerProps` change, renders will also be paused until the new Observables emit first values.
//
// If you only want to subscribe to Observables once (the Observables don't depend on outer props),
// pass `null` to `triggerProps`.
//
// Example use:
//   withObservablesSynchronized(['task'], ({ task }) => ({
//     task: task,
//     comments: task.comments.observe()
//   }))

const withObservablesSynchronized = <PropsInput: {}, ObservableProps: {}>(
  triggerProps: TriggerProps<PropsInput>,
  getObservables: GetObservables<PropsInput, ObservableProps>,
): WithObservablesSynchronized<PropsInput, ObservableProps> => {
  const getNewProps = makeGetNewProps(getObservables)

  type AddedValues = Object
  type State = {
    isFetching: boolean,
    values: AddedValues,
    triggeredFromProps: any[],
  }

  return BaseComponent => {
    // TODO: This is probably not going to be 100% safe to use under React async mode
    // Do more research
    class WithObservablesComponent extends Component<*, State> {
      _subscription: ?Subscription = null

      _isMounted = false

      _prefetchTimeout: ?TimeoutID = null

      _exitedConstructor = false

      constructor(props): void {
        super(props)
        this.state = {
          isFetching: true,
          values: {},
          triggeredFromProps: getTriggeringProps(props, triggerProps),
        }

        // The recommended React practice is to subscribe to async sources on `didMount`
        // Unfortunately, that's slow, because we have an unnecessary empty render even if we
        // can get first values before render.
        //
        // So we're subscribing in constructor, but that's dangerous. We have no guarantee that
        // the component will actually be mounted (and therefore that `willUnmount` will be called
        // to safely unsubscribe). So we're setting a safety timeout to avoid leaking memory.
        // If component is not mounted before timeout, we'll unsubscribe just to be sure.
        // (If component is mounted after all, just super slow, we'll subscribe again on didMount)
        this.subscribeWithoutSettingState(this.props)

        this._prefetchTimeout = setTimeout(() => {
          console.warn(`withObservables - unsubscribing from source. Leaky component!`)
          this.unsubscribe()
        }, prefetchTimeout)

        this._exitedConstructor = true
      }

      componentDidMount(): void {
        this._isMounted = true
        this.cancelPrefetchTimeout()

        if (!this._subscription) {
          console.warn(
            `withObservables - component mounted but no subscription present. Slow component (timed out) or something weird happened! Re-subscribing`,
          )

          const newTriggeringProps = getTriggeringProps(this.props, triggerProps)
          this.subscribe(this.props, newTriggeringProps)
        }
      }

      // eslint-disable-next-line
      UNSAFE_componentWillReceiveProps(nextProps: PropsInput): void {
        const { triggeredFromProps } = this.state
        const newTriggeringProps = getTriggeringProps(nextProps, triggerProps)

        if (!identicalArrays(triggeredFromProps, newTriggeringProps)) {
          this.subscribe(nextProps, newTriggeringProps)
        }
      }

      subscribe(props: PropsInput, triggeredFromProps: any[]): void {
        this.setState({
          isFetching: true,
          values: {},
          triggeredFromProps,
        })

        this.subscribeWithoutSettingState(props)
      }

      subscribeWithoutSettingState(props: PropsInput): void {
        this.unsubscribe()
        this._subscription = getNewProps(props).subscribe(
          values => {
            if (this._exitedConstructor) {
              this.setState({
                values,
                isFetching: false,
              })
            } else {
              // Source has called with first values synchronously while we're still in the
              // constructor. Here, `this.setState` does not work and we must mutate this.state
              // directly
              this.state.values = values
              this.state.isFetching = false
            }
          },
          error => {
            // we need to explicitly log errors from the new observables, or they will get lost
            // TODO: It can be difficult to trace back the component in which this error originates. We should maybe propagate this as an error of the component? Or at least show in the error a reference to the component, or the original `getProps` function?
            console.error(`Error in Rx composition in withObservables()`, error)
          },
        )
      }

      unsubscribe(): void {
        this._subscription && this._subscription.unsubscribe()
        this.cancelPrefetchTimeout()
      }

      cancelPrefetchTimeout(): void {
        this._prefetchTimeout && clearTimeout(this._prefetchTimeout)
        this._prefetchTimeout = null
      }

      shouldComponentUpdate(nextProps, nextState): boolean {
        // If one of the triggering props change but we don't yet have first values from the new
        // observable, *don't* render anything!
        return !nextState.isFetching
      }

      componentWillUnmount(): void {
        this.unsubscribe()
      }

      render(): * {
        const { isFetching, values } = this.state
        return isFetching ? null : createElement(BaseComponent, { ...this.props, ...values })
      }
    }

    return hoistNonReactStatic(WithObservablesComponent, BaseComponent)
  }
}

export default withObservablesSynchronized
