import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <em>Pulumipus</em>
      &nbsp;&copy;&nbsp;
      {new Date().getFullYear()}.
    </footer>
  );
};

export default Footer;
