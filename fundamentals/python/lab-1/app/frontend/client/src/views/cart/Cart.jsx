import React, { useState, useContext, useLayoutEffect } from 'react';
import CartProduct from '../../components/cartProduct/CartProduct';
import { CartContext } from '../../context/cartContext';
import style from './cart.module.css';

const Cart = () => {
  const { cart, totalCost } = useContext(CartContext);
  const [coShown, setCOShown] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.body.classList.add('noscroll-web');
    document.body.classList.add('trans');
  }, []);

  function handleCheckOut() {
    alert('Checkout - Subtotal : $ ' + totalCost);
  }

  return (
    <div className={style.page}>
      <div className={style.wrapper}>
        {cart.length > 0 ? (
          <div className={style.items}>
            {cart.map((cartItem) => (
              <CartProduct cartItem={cartItem} key={cartItem.id} />
            ))}
          </div>
        ) : (
          <div className={style.empty}>Cart Empty</div>
        )}
        <div
          className={`${style.checkout} ${coShown ? style.checkout_shown : ''}`}
        >
          <h2>Order Summary</h2>
          <div className={style.total_box}>
            <div className={style.total_box_content}>
              <div className={style.total_item}>
                <div className="text">Bag Total</div>
                <div className="price">{totalCost.toFixed(2)}</div>
              </div>
              <div className={style.total_item}>
                <div className="text">Shipping</div>
                <div className="price">Free</div>
              </div>
              <div className={`${style.total_item} ${style.coupon}`}>
                <div className="text">Discount</div>
                <div className="price">0.00</div>
              </div>
              <div className={style.total_item}>
                <div className="text">Total</div>
                <div className="price">{totalCost.toFixed(2)}</div>
              </div>
            </div>
            <div className={style.checkout_footer}>
              <button onClick={handleCheckOut} disabled={!cart.length}>
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => setCOShown(!coShown)}
        className={`${style.toggle_btn} ${coShown ? style.toggle_close : ''}`}
      >
        <span className="material-icons">keyboard_arrow_left</span>
      </button>
    </div>
  );
};

export default Cart;
