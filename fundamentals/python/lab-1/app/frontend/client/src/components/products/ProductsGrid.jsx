import React, {useState, useEffect, useCallback} from 'react';
import {request} from '../../utils/fetch';
import {Product} from './Product';
import {Loader} from '../loader/Loader';
import {Sizes} from '../filters/Sizes';
import style from './products.module.css';

const ListController = ({
                            sortOrderChange,
                            products,
                            filterChange,
                            viewChange,
                        }) => {
    const [compactView, setCompactView] = useState(true);
    const [sizerShown, setSizerShown] = useState(false);
    const [sortVal, setSortVal] = useState('0');

    const selectOptions = [
        {text: 'Order By', value: 0},
        {text: 'High to Low', value: 1},
        {text: 'Low to High', value: 2},
    ];

    function sort(order) {
        setSortVal(order);
        sortOrderChange(order);
    }

    function clearFilters() {
        filterChange([]);
        setSizerShown(false);
    }

    function changeView(compact) {
        setCompactView(compact);
        viewChange(compact ? 'compact' : 'cozy');
    }

    return (
        <div className={style.controller}>
            <div className={style.view_btns}>
                <button
                    type="button"
                    className={`${!compactView ? style.active_btn : ''}`}
                    style={{paddingTop: '8px'}}
                    onClick={() => changeView(false)}
                >
                    <span className="material-icons">view_module</span>
                </button>
                <button
                    type="button"
                    className={`${compactView ? style.active_btn : ''}`}
                    onClick={() => changeView(true)}
                >
                    <span className="material-icons">view_comfy</span>
                </button>
            </div>
            <div className={style.sort_btn}>
                <span>Sort: </span>
                <select value={sortVal} onChange={(e) => sort(e.target.value)}>
                    {selectOptions.map((opt, i) => (
                        <option value={opt.value} key={i}>
                            {opt.text}
                        </option>
                    ))}
                </select>
                <span className="material-icons">unfold_more</span>
            </div>
            <div
                className={style.filter_btn}
                onClick={(e) => setSizerShown(!sizerShown)}
            >
                <span className="material-icons">filter_alt</span>
                <span>Sizes</span>
            </div>
            {sizerShown && (
                <div className={style.size_box}>
                    <div className={style.box_header}>
                        <h4>Select Sizes</h4>
                        <button type="button" onClick={() => clearFilters()}>
                            Clear
                        </button>
                    </div>
                    <Sizes products={products} filterProducts={filterChange}/>
                </div>
            )}
        </div>
    );
};

const ProductsGrid = ({customer}) => {
    const [products, setProducts] = useState(null);
    const [gridKlass, setGridKlass] = useState('all_items');
    const [compactView, setCompactView] = useState(true);
    const [sortBy, setSortBy] = useState('created');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const url = `products?sort=${sortBy}`;
        request(url)
            .then((res) => {
                setProducts(res.data.products);
                setIsLoading(false);
            })
            .catch((err) => {
                setProducts([]);
                setIsLoading(false);
            });
    }, [sortBy]);

    useEffect(() => {
        setCustomKlass(customer);
    }, [customer]);

    function sortProducts(order) {
        switch (order) {
            case '1':
                setSortBy('-price');
                break;
            case '2':
                setSortBy('price');
                break;
            case '0':
                setSortBy('created');
                break;
            default:
                break;
        }
    }

    function changeGridView(view) {
        setCompactView(view === 'compact' ? true : false);
    }

    function setCustomKlass(custId) {
        let klass = 'all';
        switch (custId) {
            case 1:
                klass = 'all_items';
                break;
            case 2:
                klass = 'boba_items';
                break;
            case 3:
                klass = 'latte_items';
                break;
            case 4:
                klass = 'chills_items';
                break;
            default:
                klass = 'all_items';
                break;
        }
        setGridKlass(klass);
    }

    const handleProductsFilter = useCallback(
        (selectedSizes) => {
            const url = selectedSizes.length
                ? `products?sort=${sortBy}&sizes[in]=${selectedSizes.join(',')}`
                : `products?sort=${sortBy}`;

            getProducts(url, setProducts);
        },
        [sortBy]
    );

    return isLoading ? (
        <Loader/>
    ) : products && products.length > 0 ? (
        <section className={style.products_container}>
            <div className={style.container}>
                <div
                    className={`${style.grid_view} ${
                        !compactView ? style.cozy : ''
                    } ${gridKlass}`}
                >
                    {products.map((product, i) => (
                        <Product product={product} key={i}/>
                    ))}
                </div>
            </div>
            <ListController
                products={products}
                sortOrderChange={sortProducts}
                filterChange={handleProductsFilter}
                viewChange={changeGridView}
            />
        </section>
    ) : (
        <div className="no-products"> No products </div>
    );
};

function getProducts(url, setProducts) {
    request(url)
        .then((res) => {
            setProducts(res.data.products);
        })
        .catch((err) => {
            setProducts([]);
        });
}

export default ProductsGrid;
