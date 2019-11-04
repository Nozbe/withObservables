'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var react = require('react');
var hoistNonReactStatic = _interopDefault(require('hoist-non-react-statics'));
var from = require('rxjs/observable/from');
var combineLatest = require('rxjs/observable/combineLatest');
var map = require('rxjs/operators/map');

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
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

// Transforms an object of Observables into an Observable of an object
// i.e. { a: Observable<number>, b: Observable<string> } -> Observable<{ a: number, b: string }>
function combineLatestObject(object) {
  var keys = Object.keys(object);
  var observables = Object.values(object); // Optimization: If subscribing just one observable, skip combineLatest

  if (keys.length === 1) {
    var _key = keys[0]; // $FlowFixMe

    return from.from(observables[0]).pipe(map.map(function (value) {
      return {
        [_key]: value
      };
    }));
  } // $FlowFixMe


  return combineLatest.combineLatest(observables, function (...newValues) {
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

var cleanUpBatchingInterval = 250; // ms

var cleanUpInterval = 2000; // ms

var pendingCleanupActions = [];
var scheduledCleanUpScheduler = null;

function cleanUpWithObservablesActions(actions) {
  actions.forEach(function (action) {
    return action();
  });
}

function scheduleCleanUp() {
  scheduledCleanUpScheduler = null;
  var actions = pendingCleanupActions.slice(0);
  pendingCleanupActions = [];
  setTimeout(function () {
    cleanUpWithObservablesActions(actions);
  }, cleanUpInterval);
} // Apparently, setTimeout/clearTimeout functions are very expensive (22 microseconds/call)
// But we must schedule a cleanup / garbage collection action
// (https://github.com/facebook/react/issues/15317#issuecomment-491269433)
// The workaround is this: all cleanup actions scheduled within a 250ms window will be scheduled
// together (for 2500ms later).
// This way, all actions within that window will only call setTimeout twice


function scheduleForCleanup(fn) {
  pendingCleanupActions.push(fn);

  if (!scheduledCleanUpScheduler) {
    scheduledCleanUpScheduler = setTimeout(scheduleCleanUp, cleanUpBatchingInterval);
  }
}

var toObservable = function toObservable(value) {
  return typeof value.observe === 'function' ? value.observe() : value;
};

function identicalArrays(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  for (var i = 0, len = left.length; i < len; i += 1) {
    if (left[i] !== right[i]) {
      return false;
    }
  }

  return true;
}

var makeGetNewProps = function makeGetNewProps(getObservables) {
  return (// Note: named function for easier debugging
    function withObservablesGetNewProps(props) {
      // $FlowFixMe
      var rawObservables = getObservables(props);
      var observables = mapObject(toObservable, rawObservables);
      return combineLatestObject(observables);
    }
  );
};

function getTriggeringProps(props, propNames) {
  if (!propNames) {
    return [];
  }

  return propNames.map(function (name) {
    return props[name];
  });
} // TODO: This is probably not going to be 100% safe to use under React async mode
// Do more research


var WithObservablesComponent =
/*#__PURE__*/
function (_Component) {
  _inheritsLoose(WithObservablesComponent, _Component);

  function WithObservablesComponent(props, BaseComponent, getNewProps, triggerProps) {
    var _this;

    _this = _Component.call(this, props) || this;
    _this._subscription = null;
    _this._isMounted = false;
    _this._prefetchTimeoutCanceled = false;
    _this._exitedConstructor = false;
    _this.BaseComponent = BaseComponent;
    _this.triggerProps = triggerProps;
    _this.getNewProps = getNewProps;
    _this.state = {
      isFetching: true,
      values: {},
      triggeredFromProps: getTriggeringProps(props, triggerProps)
    }; // The recommended React practice is to subscribe to async sources on `didMount`
    // Unfortunately, that's slow, because we have an unnecessary empty render even if we
    // can get first values before render.
    //
    // So we're subscribing in constructor, but that's dangerous. We have no guarantee that
    // the component will actually be mounted (and therefore that `willUnmount` will be called
    // to safely unsubscribe). So we're setting a safety timeout to avoid leaking memory.
    // If component is not mounted before timeout, we'll unsubscribe just to be sure.
    // (If component is mounted after all, just super slow, we'll subscribe again on didMount)

    _this.subscribeWithoutSettingState(_this.props);

    scheduleForCleanup(function () {
      if (!_this._prefetchTimeoutCanceled) {
        console.warn("withObservables - unsubscribing from source. Leaky component!");

        _this.unsubscribe();
      }
    });
    _this._exitedConstructor = true;
    return _this;
  }

  var _proto = WithObservablesComponent.prototype;

  _proto.componentDidMount = function componentDidMount() {
    this._isMounted = true;
    this.cancelPrefetchTimeout();

    if (!this._subscription) {
      console.warn("withObservables - component mounted but no subscription present. Slow component (timed out) or something weird happened! Re-subscribing");
      var newTriggeringProps = getTriggeringProps(this.props, this.triggerProps);
      this.subscribe(this.props, newTriggeringProps);
    }
  } // eslint-disable-next-line
  ;

  _proto.UNSAFE_componentWillReceiveProps = function UNSAFE_componentWillReceiveProps(nextProps) {
    var triggeredFromProps = this.state.triggeredFromProps;
    var newTriggeringProps = getTriggeringProps(nextProps, this.triggerProps);

    if (!identicalArrays(triggeredFromProps, newTriggeringProps)) {
      this.subscribe(nextProps, newTriggeringProps);
    }
  };

  _proto.subscribe = function subscribe(props, triggeredFromProps) {
    this.setState({
      isFetching: true,
      values: {},
      triggeredFromProps
    });
    this.subscribeWithoutSettingState(props);
  };

  _proto.subscribeWithoutSettingState = function subscribeWithoutSettingState(props) {
    var _this2 = this;

    this.unsubscribe();
    this._subscription = this.getNewProps(props).subscribe(function (values) {
      return _this2.withObservablesOnChange(values);
    }, function (error) {
      // we need to explicitly log errors from the new observables, or they will get lost
      // TODO: It can be difficult to trace back the component in which this error originates. We should maybe propagate this as an error of the component? Or at least show in the error a reference to the component, or the original `getProps` function?
      console.error("Error in Rx composition in withObservables()", error);
    });
  } // DO NOT rename (we want on call stack as debugging help)
  ;

  _proto.withObservablesOnChange = function withObservablesOnChange(values) {
    if (this._exitedConstructor) {
      this.setState({
        values,
        isFetching: false
      });
    } else {
      // Source has called with first values synchronously while we're still in the
      // constructor. Here, `this.setState` does not work and we must mutate this.state
      // directly
      this.state.values = values;
      this.state.isFetching = false;
    }
  };

  _proto.unsubscribe = function unsubscribe() {
    this._subscription && this._subscription.unsubscribe();
    this.cancelPrefetchTimeout();
  };

  _proto.cancelPrefetchTimeout = function cancelPrefetchTimeout() {
    this._prefetchTimeoutCanceled = true;
  };

  _proto.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
    // If one of the triggering props change but we don't yet have first values from the new
    // observable, *don't* render anything!
    return !nextState.isFetching;
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    this.unsubscribe();
  };

  _proto.render = function render() {
    var _this$state = this.state,
        isFetching = _this$state.isFetching,
        values = _this$state.values;
    return isFetching ? null : react.createElement(this.BaseComponent, Object.assign({}, this.props, values));
  };

  return WithObservablesComponent;
}(react.Component); // Injects new props to a component with values from the passed Observables
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


var withObservablesSynchronized = function withObservablesSynchronized(triggerProps, getObservables) {
  var getNewProps = makeGetNewProps(getObservables);
  return function (BaseComponent) {
    var ConcreteWithObservablesComponent =
    /*#__PURE__*/
    function (_WithObservablesCompo) {
      _inheritsLoose(ConcreteWithObservablesComponent, _WithObservablesCompo);

      function ConcreteWithObservablesComponent(props) {
        return _WithObservablesCompo.call(this, props, BaseComponent, getNewProps, triggerProps) || this;
      }

      return ConcreteWithObservablesComponent;
    }(WithObservablesComponent);

    return hoistNonReactStatic(ConcreteWithObservablesComponent, BaseComponent);
  };
};

module.exports = withObservablesSynchronized;
