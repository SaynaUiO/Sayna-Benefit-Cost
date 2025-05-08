import ReactDOM from 'react-dom';
import { App } from './App'
import { view } from "@forge/bridge";
import { setGlobalTheme } from "@atlaskit/tokens";

import '@atlaskit/css-reset';

view.theme.enable()
setGlobalTheme({light: "light", dark: "dark", colorMode: 'auto'})

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
