# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

- Observable errors are now re-thrown in render, so that you can catch them with an Error Boundary
- withObservable no longer has a dependency on RxJS package, which makes it leaner, more performant
   and should hopefully fix persistent issues with rxjs-compat that some users have

## 1.0.8 - 2020-12-17

- Fix Flow issues when running Flow 0.140.0

## 1.0.7 - 2020-10-27

- Improve performance
- Name functions for easier debugging / profiling
- Fix RxJS issue

## 1.0.5 - 2019-08-10

- Fix Typescript bindings

## 1.0.4 - 2019-08-02

- Add Typescript bindings

## 1.0.3 - 2019-03-14

- Add hoist-non-react-statics

## 1.0.2 - 2018-10-26

- [Flow] Fixed types for Flow 0.84.0

## 1.0.1 - 2018-09-19

### Fixed

- Fixed Flow typings for withObservables (this now works without any setup)
- Fixed Flow for injecting props using WatermelonDB Relation objects (skipping `.observe()`)

## 1.0.0 - 2018-09-07

Initial release of withObservables HOC
