declare module "@nozbe/with-observables" {
   import { ComponentType } from "react";
   import { Observable } from "rxjs/Observable";

   interface ObservableConvertible<T> {
     readonly observe: () => Observable<T>;
   }
   type ValueOf<T> = T[keyof T];
   type ExtractObservableTypes<T> =
     T extends Observable<infer U> ? U :
     T extends ObservableConvertible<infer U> ? U :
     T;
   type ExtractedObservables<T> = {
     [K in keyof T]: ExtractObservableTypes<ValueOf<T>>
   }

   export default function withObservables<InputProps, ObservableProps>(
     triggerProps: Array<keyof InputProps>,
     getObservables: (props: InputProps) => ObservableProps
   ): (Wrapped: ComponentType<ExtractedObservables<ObservableProps>>)
     => ComponentType<InputProps>;
}

