import React from 'react';
import PropTypes from 'prop-types';
import './checkbox.css';

const Checkbox = ({ label, name, id, ...props }) => {
  return (
    <p className="cb">
      <input type="checkbox" name={name} id={name} {...props} />
      <label htmlFor={name}>{label}</label>
    </p>
  );
};

Checkbox.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

export default Checkbox;
