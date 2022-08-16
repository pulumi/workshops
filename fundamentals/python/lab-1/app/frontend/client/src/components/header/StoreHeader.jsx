import React, { useState } from 'react';
import style from './header.module.css';

const TeaMenus = () => {
  const teaTypes = [
    {
      id: 1,
      title: 'Boba Tea',
      active: false,
    },
  ];

  return (
    <div className={style.store_menu_wrapper}>
      <div className={style.store_menu}>
        {teaTypes.map((type) => (
          <div key={type.id} className={style.store_menu_item}>
            <h2
              className={`${style.store_menu_title} ${
                type.active && style.store_menu_title_active
              }`}
            >
              {type.title}
            </h2>
          </div>
        ))}
      </div>
      <div className={style.fader}></div>
    </div>
  );
};

const TabsController = ({ customerTypeChange: teaTypeChange }) => {
  const [active, setActive] = useState(1);

  const changeTeaType = (e) => {
    setActive(e);
    teaTypeChange(e);
  };

  return (
    <div className={style.tabs_controller}>
      <div className={style.container_centered}>
        <ul className={style.tab_menus}>
          <li
            className={active === 1 ? style.active_tab : ''}
            onClick={() => changeTeaType(1)}
          >
            All
          </li>
          <li
            className={active === 2 ? style.active_tab : ''}
            onClick={() => changeTeaType(2)}
          >
            Boba
          </li>
          <li
            className={active === 3 ? style.active_tab : ''}
            onClick={() => changeTeaType(3)}
          >
            Latte
          </li>
          <li
            className={active === 4 ? style.active_tab : ''}
            onClick={() => changeTeaType(4)}
          >
            Chills
          </li>
        </ul>
      </div>
    </div>
  );
};

const StoreHeader = ({ customer, customerChange }) => {
  return (
    <>
      <TeaMenus />
      <TabsController
        customerType={customer}
        customerTypeChange={customerChange}
      />
    </>
  );
};

export default StoreHeader;
