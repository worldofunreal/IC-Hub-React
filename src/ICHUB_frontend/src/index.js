import React from 'react';

import { render } from 'react-dom';
import { NavLink, Router, Route, Switch } from 'react-router-dom';
import {createBrowserHistory} from "history";
import AppProvider from "./context";
import ChatICAppProvider from "./chatSDK/chatAppContext";

import App from "./App";

var hist = createBrowserHistory();

document.title = "IC HUB";

render(
  <ChatICAppProvider>
    <AppProvider>
      <Router history={hist}>
        <Switch>
          <Route path="/" component={App}></Route>
        </Switch>
      </Router>
    </AppProvider>
  </ChatICAppProvider>, 
  document.getElementById("root")
);
