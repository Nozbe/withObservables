import { Subject } from 'rxjs/Subject'

import combineLatestObject from 'combineLatestObject'

describe('utils/rx/combineLatestObject', () => {
  it('combines latest values from an object', () => {
    const a = new Subject()
    const b = new Subject()
    const c = new Subject()

    const observable = combineLatestObject({ a, b, c })
    const nextObserver = jest.fn()
    const completionObservable = jest.fn()
    observable.subscribe(nextObserver, null, completionObservable)

    expect(nextObserver).toHaveBeenCalledTimes(0)

    a.next('a1')
    a.next('a2')
    c.next('c1')
    b.next('b1')

    expect(nextObserver).lastCalledWith({ a: 'a2', b: 'b1', c: 'c1' })
    expect(nextObserver).toHaveBeenCalledTimes(1)

    b.next('b2')
    b.next('b3')
    a.next('a3')

    expect(nextObserver).lastCalledWith({ a: 'a3', b: 'b3', c: 'c1' })
    expect(nextObserver).toHaveBeenCalledTimes(4)

    a.complete()
    b.complete()

    expect(completionObservable).toHaveBeenCalledTimes(0)

    c.complete()

    expect(completionObservable).toHaveBeenCalledTimes(1)
    expect(nextObserver).toHaveBeenCalledTimes(4)
  })
  it('throws error if any observable errors', () => {
    const a = new Subject()
    const b = new Subject()

    const observable = combineLatestObject({ a, b })
    const nextObserver = jest.fn()
    const errorObserver = jest.fn()
    observable.subscribe(nextObserver, errorObserver)

    b.error('test error')
    a.next('a1')

    expect(errorObserver).lastCalledWith('test error')

    expect(errorObserver).toHaveBeenCalledTimes(1)
    expect(nextObserver).toHaveBeenCalledTimes(0)
  })
})
