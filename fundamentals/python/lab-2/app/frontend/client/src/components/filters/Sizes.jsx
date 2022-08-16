import React, { useState, useEffect } from 'react';
import Checkbox from './Checkbox';
import style from '../products/products.module.css';

export const Sizes = ({ products, filterProducts }) => {
  const [sizes, setSizes] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  useEffect(() => {
    const arr = [];
    products.forEach((p) => {
      arr.push(...p.sizes);
    });
    const sizeSet = new Set(arr);
    const sizesArr = [...sizeSet];
    setSizes(sizesArr);
  }, [products]);

  useEffect(() => {
    filterProducts(selectedSizes);
  }, [selectedSizes, filterProducts]);

  function handleOnCheck(e) {
    const isChecked = e.target.checked;
    const size = e.target.name;
    if (isChecked) {
      setSelectedSizes((sizes) => [...sizes, size]);
    } else {
      const selectedFiltered = selectedSizes.filter((ss) => size !== ss);
      setSelectedSizes(selectedFiltered);
    }
  }

  return (
    <div className={style.sizes}>
      {sizes.length &&
        sizes.map((s) => (
          <div className={style.size} key={s}>
            <Checkbox label={s} name={s} id={s} onChange={handleOnCheck} />
          </div>
        ))}
    </div>
  );
};
