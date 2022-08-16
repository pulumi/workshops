import React, {useContext} from 'react';
import {NavLink} from 'react-router-dom';
import {CartContext} from '../../context/cartContext';
import style from './header.module.css';
import logo from '../../img/science.png'

const Header = () => {
    const {cartSize} = useContext(CartContext);

    return (
        <header className={style.header}>
            <div className={style.container}>
                <nav className={style.header_nav}>
                    <div className={style.brand}>
                        <NavLink className={style.text_logo} to="/">
                            <div className={style.logo_box}>
                                <img
                                    alt={"A purple platypus named Pulumipus with a pair of goggles on and an Erlenmeyer flask held up in one hand. The flask has a bubbling liquid in it."}
                                    src={logo} className={style.logo}/>
                                <div>
                                    Pulumipus Tea Shop
                                </div>
                            </div>
                        </NavLink>
                    </div>
                    <NavLink to="/cart" className={style.cart}>
                        {cartSize || <span className="material-icons">shopping_cart</span>}
                    </NavLink>
                </nav>
            </div>
        </header>
    );
};

export default Header;
