import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { CartProvider } from './context/cartContext';
import Header from './components/header/Header';
import { Loader } from './components/loader/Loader';

const Cart = lazy(() => import('./views/cart/Cart'));
const Home = lazy(() => import('./views/homepage/Home'));
const ViewProduct = lazy(() => import('./views/product/ViewProduct'));

function App() {
  return (
    <CartProvider>
      <Router>
        <>
          <Header />
          <Suspense fallback={<Loader />}>
            <Switch>
              <Route path="/" exact component={Home} />
              <Route path="/product/:id" component={ViewProduct} />
              <Route path="/cart" component={Cart} />
              <Route path="*" component={Home} />
            </Switch>
          </Suspense>
        </>
      </Router>
    </CartProvider>
  );
}

export default App;
