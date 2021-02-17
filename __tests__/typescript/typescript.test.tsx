import * as React from "react";
import withObservables, { ExtractedObservables } from "@nozbe/with-observables";
import { Model, Database } from "@nozbe/watermelondb";
import {expectType} from 'tsd-check';

const TABLE_NAME = "table";

const getObservables = ({
  id,
  model,
  database,
}: {
  id: string,
  model: Model,
  database: Database,
}) => {
  const model$ = database.collections.get(TABLE_NAME).findAndObserve(id);
  return {
    model: model,
    keyChanged: model,
    observedModel: model.observe(),
    secondModel: model$,
  };
};

interface ChildProps extends ExtractedObservables<ReturnType<typeof getObservables>> {
  passThrough: string;
}
class Child extends React.PureComponent<ChildProps> {
  static options = {
    header: "Header Text",
  };
  render() {
    const { model, keyChanged, observedModel, secondModel, passThrough } = this.props;
    return (
      <>
        <>{passThrough}</>
        <>{model.id}</>
        <>{keyChanged.id}</>
        <>{observedModel.id}</>
        <>{secondModel.id}</>
      </>
    );
  }
}

const WrappedChild = withObservables(["id"], getObservables)(Child);

// @ts-ignore
const database!: Database

const element = <WrappedChild
  passThrough="abc"
  id="123"
  model={new Model()}
  database={database}
/>;

expectType<string>(WrappedChild.options.header);
