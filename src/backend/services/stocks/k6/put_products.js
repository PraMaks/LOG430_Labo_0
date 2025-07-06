import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 50,
  duration: '30s',
};

export function setup() {
  const loginRes = http.post('http://localhost:80/api/v1/auth/users/login', JSON.stringify({
    username: 'admin',
    password: 'admin123'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });

  check(loginRes, {
    'login succeeded': (r) => r.status === 200,
    'token exists': (r) => JSON.parse(r.body).token !== undefined,
  });

  const token = JSON.parse(loginRes.body).token;
  return { token };
}

export default function (data) {
  const res = http.put(
    'http://localhost:80/api/v1/stocks/storesAll/Candy2',
    JSON.stringify({
      price: Math.floor(Math.random() * 10),
    }),
    {
      headers: {
        Authorization: data.token,
        'Content-Type': 'application/json',
      },
    }
  );

  check(res, {
    'stock update succeeded': (r) => r.status === 200,
  });
}