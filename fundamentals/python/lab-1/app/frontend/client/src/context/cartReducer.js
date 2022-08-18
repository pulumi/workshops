import shortid from 'shortid';

export const SET_PRODUCT = 'SET_PRODUCT';
export const REMOVE_PRODUCT = 'REMOVE_PRODUCT';
export const QTY_UPDATE = 'QTY_UPDATE';

export default (state, action) => {
  switch (action.type) {
    case SET_PRODUCT:
      return setProduct(state, action.payload);
    case REMOVE_PRODUCT:
      return removeProduct(state, action.payload);
    case QTY_UPDATE:
      return qtyProduct(state, action.payload);
    default:
      return state;
  }
};

function setProduct(state, cartItem) {
  const item = state.cart.find((ci) => ci.product._id === cartItem.product._id);
  const index = state.cart.findIndex(
    (ci) => ci.product._id === cartItem.product._id
  );
  if (item) {
    const newItem = {
      ...item,
      qty: item.qty + 1,
    };
    newItem['allCost'] = item.product.price * newItem.qty;
    const cart = state.cart.filter((c, i) => i !== index);
    const newCart = [...cart, newItem].sort((a, b) => a.date - b.date);
    const totalCost = getTotal(newCart);
    return {
      ...state,
      totalCost,
      cart: newCart,
      cartSize: state.cartSize + 1,
    };
  }
  cartItem['allCost'] = cartItem.product.price;
  cartItem['id'] = shortid();
  cartItem['date'] = Date.now();
  const newCart = [...state.cart, cartItem];
  const totalCost = getTotal(newCart);
  return {
    ...state,
    totalCost,
    cart: newCart,
    cartSize: state.cartSize + 1,
  };
}

/**
 * Returns the total of the bag
 * @param {Array} cart all the cart items in a array
 * @returns number
 */
function getTotal(cart) {
  return cart.map((c) => Number(c.allCost)).reduce((a, b) => a + b, 0);
}

function removeProduct(state, id) {
  const cart = state.cart.filter((item) => item.id !== id);
  const totalCost = getTotal(cart);
  const cartSize = cart.map((c) => c.qty).reduce((a, b) => a + b, 0);
  return { ...state, cart, totalCost, cartSize };
}

function qtyProduct(state, cartItem) {
  const item = state.cart.find((ci) => ci.product._id === cartItem.product._id);
  const upItem = {
    ...item,
    qty: cartItem.qty,
    allCost: item.product.price * cartItem.qty,
  };
  const cart = state.cart.filter((item) => item.id !== cartItem.id);
  const newCart = [...cart, upItem].sort((a, b) => a.date - b.date);
  const totalCost = getTotal(newCart);
  const cartSize = newCart.map((c) => c.qty).reduce((a, b) => a + b, 0);
  return { ...state, cart: newCart, totalCost, cartSize };
}
