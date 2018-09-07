# `withObservables`

A [higher-order component](https://reactjs.org/docs/higher-order-components.html) for connecting RxJS [Observables](https://github.com/ReactiveX/rxjs) to React components.

## Example

(Taken from [WatermelonDB](https://github.com/Nozbe/WatermelonDB/))

```js
const Post = ({ post, comments }) => (
  <article>
    <h1>{post.name}</h1>
    <p>{post.body}</p>
    <h2>Comments</h2>
    {comments.map(comment =>
      <EnhancedComment key={comment.id} comment={comment} />
    )}
  </article>
)

const enhance = withObservables(['post'], ({ post }) => ({
  post: post.observe(),
  comments: post.comments.observe()
}))

const EnhancedPost = enhance(Post)
```

**➡️ Learn more:** [Connecting WatermelonDB to Components](https://github.com/Nozbe/WatermelonDB/blob/master/docs/Components.md)

## Installation

```bash
yarn add @nozbe/with-observables
```

And then to use:

```js
import withObservables from '@nozbe/with-observables'
```

## Usage

```js
withObservablesSynchronized(triggerProps, getObservables)

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
```

## Author and license

**withObservables** was created by [@Nozbe](https://github.com/Nozbe) for [WatermelonDB](https://github.com/Nozbe/WatermelonDB).

withObservables is available under the MIT license. See the [LICENSE](./LICENSE) file for more info.
