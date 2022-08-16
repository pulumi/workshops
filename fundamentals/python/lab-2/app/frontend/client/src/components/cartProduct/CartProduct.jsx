import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { CartContext } from '../../context/cartContext';
import style from '../../views/cart/cart.module.css';

function importAllImages(r) {
  let images = {};
  r.keys().map((item, index) => { images[item.replace('../../', '')] = r(item); });
  return images;
}

const images = importAllImages(require.context('../../img', false, /\.png$/));

const CartProduct = ({ cartItem }) => {
  const { removeProduct, qtyUpdate } = useContext(CartContext);
  const [qty, setQty] = useState(0);

  useEffect(() => {
    if (cartItem) {
      setQty(cartItem.qty);
    }
  }, [cartItem]);

  function handleRemoveProduct() {
    removeProduct(cartItem.id);
  }

  function increment() {
    setQty(qty + 1);
    qtyUpdate({ ...cartItem, qty: qty + 1 });
  }

  function decrement() {
    if (qty === 1) return false;
    setQty(qty - 1);
    qtyUpdate({ ...cartItem, qty: qty - 1 });
  }

  const getCustomerType = (code) => {
    let cust = '';
    switch (code) {
      case 1:
        cust = "Tasty";
        break;
      case 2:
        cust = "Yummy";
        break;
      case 3:
        cust = "Delightful";
        break;
      case 5:
        cust = "Scrumptious";
        break;
      default:
        cust = "Delicious";
        break;
    }
    return cust;
  };

  return (
    <div className={style.item}>
      <div className={style.item_wrapper}>
        <div className={style.item_remove}>
          <button type="button" onClick={handleRemoveProduct}>
            <span className="material-icons">close</span>
          </button>
        </div>
        <div className={style.item_image}>
          <img
            src={cartItem.product.images[0].src ? images[`./${cartItem.product.images[0].src}`].default : ""}
            alt={cartItem.product.name}
          />
        </div>
        <div className={style.item_details}>
          <h3>{cartItem.product.name}</h3>
          <div className={style.item_meta}>
            {getCustomerType(cartItem.product.teaType)}{' '}
            {cartItem.product.category}
          </div>
        </div>
        <div className={style.item_controller}>
          {/* <div className="text">Quantity</div> */}

          <button type="button" onClick={decrement} disabled={qty === 1}>
            <i className="material-icons">remove</i>
          </button>
          <span>{qty}</span>
          <button type="button" onClick={increment}>
            <i className="material-icons">add</i>
          </button>
        </div>
        <div className={style.item_price}>
          {cartItem.product.currency.format} {cartItem.allCost.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

CartProduct.propTypes = {
  id: PropTypes.string,
  allCost: PropTypes.number,
  date: PropTypes.number,
  qty: PropTypes.number,
  product: PropTypes.shape({
    image: PropTypes.string,
    created: PropTypes.number,
    currency: PropTypes.object,
    sizes: PropTypes.array,
    name: PropTypes.string,
    price: PropTypes.number,
    description: PropTypes.string,
    _id: PropTypes.string,
  }),
};

export default CartProduct;
