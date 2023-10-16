import http from 'k6/http';
import {uuidv4} from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export default function () {
    const url = 'http://localhost:3000/neworder';

    let payload = JSON.stringify({
        "orderId": uuidv4(),
        "timestamp": "2023-10-14T12:34:56Z",
        "items": [
            {
                "itemId": "item1",
                "description": "Product 1",
                "price": 10
            },
            {
                "itemId": "item2",
                "description": "Product 2",
                "price": 15
            }
        ],
        "address": {
            "street": "123 Main St",
            "city": "Exampleville",
            "state": "CA",
            "zipcode": "12345"
        },
        "customerId": "67890"
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    http.post(url, payload, params);
}
