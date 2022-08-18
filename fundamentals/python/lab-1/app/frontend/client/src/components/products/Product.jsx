import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import style from '../products/products.module.css';

function importAllImages(r) {
  let images = {};
  r.keys().map((item, index) => { images[item.replace('../../', '')] = r(item); });
  return images;
}

const images = importAllImages(require.context('../../img', false, /\.png$/));

console.log(images['./classic_boba.png'].default)

export const Product = ({ product }) => {
  const history = useHistory();

  function showProductDetails(id) {
    history.push(
      `/product/${product.name.split(' ').join('-')}-${product._id}`
    );
  }

  function getItemKlass(custId) {
    let klass = 'prod all_item';
    switch (custId) {
      case 1:
        klass += '';
        break;
      case 2:
        klass += ' boba_item';
        break;
      case 3:
        klass += ' latte_item';
        break;
      case 4:
        klass += ' chills_item';
        break;
      default:
        klass = '';
        break;
    }
    return klass;
  }

  return (
    <div
      key={product._id}
      className={`${style.product_card} ${getItemKlass(product.teaType)}`}
      onClick={() => showProductDetails(product)}
    >
      <div className={style.card_image}>
        <img src={product.images[0].src ? images[`./${product.images[0].src}`].default : ""} alt={product.name} />
      </div>
      <div className={style.card_status}>
        {product.status === 0 && (
          <span className={`${style.card_badge} ${style.soldout_badge}`}>
            Sold Out
          </span>
        )}
        {product.status === 1 && (
          <span className={`${style.card_badge} ${style.new_badge}`}>NEW</span>
        )}
        {product.status === 3 && (
          <span className={`${style.card_badge} ${style.upcoming_badge}`}>
            Coming Soon
          </span>
        )}
      </div>
      <div className={style.card_content}>
        <div className={style.card_info}>
          <h3>{product.name}</h3>
          <p>
            {' '}
            {product.currency.format} {product.price.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

Product.propTypes = {
  product: PropTypes.shape({
    image: PropTypes.string,
    created: PropTypes.number,
    currency: PropTypes.object,
    sizes: PropTypes.array,
    name: PropTypes.string,
    price: PropTypes.number,
    description: PropTypes.string,
    _id: PropTypes.string,
  }).isRequired,
};
