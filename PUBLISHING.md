# Publishing

```
yarn ci:check
yarn build
# update readme
npm version 1.1.1-1
npm publish --tag next
git push && git push --tags
```
