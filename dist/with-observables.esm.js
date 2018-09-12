import { from } from 'rxjs/observable/from';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { map } from 'rxjs/operators/map';
import { Component, createElement } from 'react';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

// inspired by ramda and rambda

/* eslint-disable */
var zipObj = function zipObj(keys, values) {
  if (values === undefined) {
    return function (values) {
      return zipObj(keys, values);
    };
  }

  var result = {};

  for (var i = 0, l = Math.min(keys.length, values.length); i < l; i++) {
    result[keys[i]] = values[i];
  }

  return result;
};

/*:: import type { Observable } from 'rxjs/Observable'*/
/*:: type ExtractObservableType = <T>(?Observable<T>) => T*/

// Transforms an object of Observables into an Observable of an object
// i.e. { a: Observable<number>, b: Observable<string> } -> Observable<{ a: number, b: string }>
function combineLatestObject
/*:: <
  ObjectOfObservables: {
    [key: string]: Observable<*>,
  },
>*/
(object
/*: ObjectOfObservables*/
)
/*: Observable<$ObjMap<ObjectOfObservables, ExtractObservableType>>*/
{
  var keys = Object.keys(object);
  var observables = Object.values(object); // Optimization: If subscribing just one observable, skip combineLatest

  if (keys.length === 1) {
    var _key = keys[0]; // $FlowFixMe

    return from(observables[0]).pipe(map(function (value) {
      return {
        [_key]: value
      };
    }));
  } // $FlowFixMe


  return combineLatest(observables, function (...newValues) {
    return zipObj(keys, newValues);
  });
}

// inspired by ramda and rambda

/* eslint-disable */
var mapObject = function mapObject(fn, obj) {
  var willReturn = {};

  for (var prop in obj) {
    willReturn[prop] = fn(obj[prop], prop);
  }

  return willReturn;
};

/*:: import type { Observable, Subscription } from 'rxjs'*/
/*:: type UnaryFn<A, R> = (a: A) => R*/

/*:: type HOC<Base, Enhanced> = UnaryFn<React$ComponentType<Base>, React$ComponentType<Enhanced>>*/

/*:: type ExtractModelTypes = <T>(value: ?Observable<T> | ?T) => T*/

/*:: type TriggerProps<A> = $Keys<A>[] | null*/

/*:: type GetObservables<A, B> = (props: A) => B*/

/*:: type WithObservablesSynchronized<Props, ObservableProps> = HOC<{ ...$Exact<Props>, ...$ObjMap<ObservableProps, ExtractModelTypes> },
  Props,>*/

var toObservable = function toObservable(value
/*: any*/
) {
  return (
    /*: Observable<any>*/
    typeof value.observe === 'function' ? value.observe() : value
  );
};

var identicalArrays = function identicalArrays(arrayA
/*: V*/
, arrayB
/*: V*/
) {
  return (
    /*: boolean*/
    arrayA.length === arrayB.length && arrayA.every(function (el, index) {
      return el === arrayB[index];
    })
  );
};

var makeGetNewProps
/*: <A: {}, B: {}>(
  GetObservables<A, B>,
) => A => Observable<*>*/
= function makeGetNewProps(getObservables) {
  return function (props) {
    // $FlowFixMe
    var rawObservables = getObservables(props);
    var observables = mapObject(toObservable, rawObservables);
    return combineLatestObject(observables);
  };
};

function getTriggeringProps
/*:: <PropsInput: {}>*/
(props
/*: PropsInput*/
, propNames
/*: TriggerProps<PropsInput>*/
)
/*: any[]*/
{
  if (!propNames) {
    return [];
  }

  return propNames.map(function (name) {
    return props[name];
  });
}

var prefetchTimeout = 2000; // ms
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

var withObservablesSynchronized = function withObservablesSynchronized(triggerProps
/*: TriggerProps<PropsInput>*/
, getObservables
/*: GetObservables<PropsInput, ObservableProps>*/
)
/*: WithObservablesSynchronized<PropsInput, ObservableProps>*/
{
  var getNewProps = makeGetNewProps(getObservables);
  /*:: type AddedValues = Object*/

  /*:: type State = {
      isFetching: boolean,
      values: AddedValues,
      triggeredFromProps: any[],
    }*/

  return function (BaseComponent) {
    return (
      /*#__PURE__*/
      // TODO: This is probably not going to be 100% safe to use under React async mode
      // Do more research
      function (_Component) {
        _inherits(WithObservablesComponent, _Component);

        function WithObservablesComponent(props)
        /*: void*/
        {
          var _this;

          _classCallCheck(this, WithObservablesComponent);

          _this = _possibleConstructorReturn(this, _getPrototypeOf(WithObservablesComponent).call(this, props));
          _this._subscription = null;
          _this._isMounted = false;
          _this._prefetchTimeout = null;
          _this._exitedConstructor = false;
          _this.state = {
            isFetching: true,
            values: {},
            triggeredFromProps: getTriggeringProps(props, triggerProps) // The recommended React practice is to subscribe to async sources on `didMount`
            // Unfortunately, that's slow, because we have an unnecessary empty render even if we
            // can get first values before render.
            //
            // So we're subscribing in constructor, but that's dangerous. We have no guarantee that
            // the component will actually be mounted (and therefore that `willUnmount` will be called
            // to safely unsubscribe). So we're setting a safety timeout to avoid leaking memory.
            // If component is not mounted before timeout, we'll unsubscribe just to be sure.
            // (If component is mounted after all, just super slow, we'll subscribe again on didMount)

          };

          _this.subscribeWithoutSettingState(_this.props);

          _this._prefetchTimeout = setTimeout(function () {
            console.warn("withObservables - unsubscribing from source. Leaky component!");

            _this.unsubscribe();
          }, prefetchTimeout);
          _this._exitedConstructor = true;
          return _this;
        }

        _createClass(WithObservablesComponent, [{
          key: "componentDidMount",
          value: function componentDidMount()
          /*: void*/
          {
            this._isMounted = true;
            this.cancelPrefetchTimeout();

            if (!this._subscription) {
              console.warn("withObservables - component mounted but no subscription present. Slow component (timed out) or something weird happened! Re-subscribing");
              var newTriggeringProps = getTriggeringProps(this.props, triggerProps);
              this.subscribe(this.props, newTriggeringProps);
            }
          } // eslint-disable-next-line

        }, {
          key: "UNSAFE_componentWillReceiveProps",
          value: function UNSAFE_componentWillReceiveProps(nextProps
          /*: PropsInput*/
          )
          /*: void*/
          {
            var triggeredFromProps = this.state.triggeredFromProps;
            var newTriggeringProps = getTriggeringProps(nextProps, triggerProps);

            if (!identicalArrays(triggeredFromProps, newTriggeringProps)) {
              this.subscribe(nextProps, newTriggeringProps);
            }
          }
        }, {
          key: "subscribe",
          value: function subscribe(props
          /*: PropsInput*/
          , triggeredFromProps
          /*: any[]*/
          )
          /*: void*/
          {
            this.setState({
              isFetching: true,
              values: {},
              triggeredFromProps
            });
            this.subscribeWithoutSettingState(props);
          }
        }, {
          key: "subscribeWithoutSettingState",
          value: function subscribeWithoutSettingState(props
          /*: PropsInput*/
          )
          /*: void*/
          {
            var _this2 = this;

            this.unsubscribe();
            this._subscription = getNewProps(props).subscribe(function (values) {
              if (_this2._exitedConstructor) {
                _this2.setState({
                  values,
                  isFetching: false
                });
              } else {
                // Source has called with first values synchronously while we're still in the
                // constructor. Here, `this.setState` does not work and we must mutate this.state
                // directly
                _this2.state.values = values;
                _this2.state.isFetching = false;
              }
            }, function (error) {
              // we need to explicitly log errors from the new observables, or they will get lost
              console.error(error);
            });
          }
        }, {
          key: "unsubscribe",
          value: function unsubscribe()
          /*: void*/
          {
            this._subscription && this._subscription.unsubscribe();
            this.cancelPrefetchTimeout();
          }
        }, {
          key: "cancelPrefetchTimeout",
          value: function cancelPrefetchTimeout()
          /*: void*/
          {
            this._prefetchTimeout && clearTimeout(this._prefetchTimeout);
            this._prefetchTimeout = null;
          }
        }, {
          key: "shouldComponentUpdate",
          value: function shouldComponentUpdate(nextProps, nextState)
          /*: boolean*/
          {
            // If one of the triggering props change but we don't yet have first values from the new
            // observable, *don't* render anything!
            return !nextState.isFetching;
          }
        }, {
          key: "componentWillUnmount",
          value: function componentWillUnmount()
          /*: void*/
          {
            this.unsubscribe();
          }
        }, {
          key: "render",
          value: function render()
          /*: ?React$Node*/
          {
            var _this$state = this.state,
                isFetching = _this$state.isFetching,
                values = _this$state.values;
            return isFetching ? null : createElement(BaseComponent, _objectSpread({}, this.props, values));
          }
        }]);

        return WithObservablesComponent;
      }(Component)
    );
  };
};

export default withObservablesSynchronized;
