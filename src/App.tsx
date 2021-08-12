import { observer } from 'mobx-react';
import React from 'react';

import { Loaders } from './loaders/Loaders';

import './app.scss';
import { TeaCup } from './art/tea-cup/TeaCup';

@observer
export class App extends React.PureComponent {
  public render() {
    return (
      <div className={'panels'}>
        <Loaders />
        <TeaCup />
      </div>
    );
  }
}
