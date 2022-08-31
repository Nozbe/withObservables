# `withObservables`

  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT License">
  </a>

  <a href="https://travis-ci.com/Nozbe/withObservables">
    <img src="https://api.travis-ci.com/Nozbe/withObservables.svg?branch=master" alt="CI Status">
  </a>

  <a href="https://www.npmjs.com/package/@nozbe/with-observables">
    <img src="https://img.shields.io/npm/v/@nozbe/with-observables.svg" alt="npm">
  </a>

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

**➡️ Learn more:** [Connecting WatermelonDB to Components](https://nozbe.github.io/WatermelonDB/Components.html)

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
withObservables(triggerProps, getObservables)

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
// Errors are re-thrown in render(). Use React Error Boundary to catch them.
//
// Example use:
//   withObservables(['task'], ({ task }) => ({
//     task: task,
//     comments: task.comments.observe()
//   }))
```

## Typescript

The TypeScript bindings expose a helper type, `ObservableifyProps<Props, ObservableKeys, ObservableConvertibleKeys>` which can make it easier to wrap components without duplicating interfaces:
```ts
interface Props {
  post: Post;
  author: Author;
  someOtherProp: boolean;
  anotherProp: number;
}

const PostRenderer: React.FC<Props> = (props) => ( ... );

type InputProps = ObservableifyProps<Props, "author", "post">
const enhance = withObservables(["post", "author"], ({ post }: InputProps) => ({
  post,
  author: author.observe()
});

export default enhance(PostRenderer);
```

Or you can let `getObservables` define your props for you:
```tsx
import withObservables, {ExtractedObservables} from "@nozbe/with-observables"

const getObservables = ({ post }: { post: Post }}) => ({
  post,
  author: author.observe()
});

interface Props extends ExtractedObservables<ReturnType<typeof getObservables>> {
  someOtherProp: boolean;
  anotherProp: number;
}

const PostRenderer: React.FC<Props> = (props) => (
  <>{props.author.id}</>
);

export default withObservables(["post"], getObservables)(PostRenderer);
```

## Author and license

**withObservables** was created by [@Nozbe](https://github.com/Nozbe) for [WatermelonDB](https://github.com/Nozbe/WatermelonDB).

**withObservables**' main author and maintainer is [Radek Pietruszewski](https://github.com/radex) ([website](https://radex.io) ⋅ [twitter](https://twitter.com/radexp) ⋅ [engineering posters](https://beamvalley.com))

[See all contributors](https://github.com/Nozbe/withObservables/graphs/contributors).

withObservables is available under the MIT license. See the [LICENSE](./LICENSE) file for more info.
