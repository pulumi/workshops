import React, { useEffect, useState } from 'react';
import ProductsGrid from '../../components/products/ProductsGrid';
import StoreHeader from '../../components/header/StoreHeader';
import Footer from '../../components/footer/Footer';

const Home = () => {
  useEffect(() => {
    document.body.classList.remove('noscroll-web');
    document.body.classList.remove('trans');
  }, []);

  const [customer, setCustomer] = useState(1);

  return (
    <>
      <StoreHeader customer={customer} customerChange={(e) => setCustomer(e)} />
      <ProductsGrid customer={customer} />
      <Footer />
    </>
  );
};

export default Home;
