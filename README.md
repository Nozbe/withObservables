# `withObservables`

A [higher-order component](https://reactjs.org/docs/higher-order-components.html) for connecting [Observables](https://github.com/ReactiveX/rxjs) to React components.

### Example

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

Learn more: https://github.com/Nozbe/WatermelonDB/blob/master/docs/Components.md
