declare module "@nozbe/with-observables" {
  import { ComponentType } from "react";
  import { Observable } from "rxjs/Observable";

  interface ObservableConvertible<T> {
    readonly observe: () => Observable<T>;
  }

  type ExtractObservableType<T> =
    T extends Observable<infer U> ? U :
      T extends ObservableConvertible<infer U> ? U :
        T;
  type ExtractedObservables<T> = {
    [K in keyof T]: ExtractObservableType<T[K]>
  }

  type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
  export type ObservableifyProps<T, O extends keyof T, C extends keyof T = never> = {
    [K in keyof Pick<T, O>]: Observable<T[K]>;
  } & {
    [K in keyof Pick<T, C>]: ObservableConvertible<T[K]>
  } & Omit<T, O | C>

  export default function withObservables<InputProps, ObservableProps>(
    triggerProps: Array<keyof InputProps>,
    getObservables: (props: InputProps) => ObservableProps
  ): <OwnProps>(Wrapped: ComponentType<ExtractedObservables<OwnProps>>)
    => ComponentType<InputProps>;
}
