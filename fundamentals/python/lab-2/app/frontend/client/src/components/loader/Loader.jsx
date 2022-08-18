import React from 'react';
import './Loader.css';

export const Loader = () => {
  return (
    <div className="loading-container">
      <div className="lds-facebook">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};
