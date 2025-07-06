import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 50, // utilisateurs simultanés
  duration: '30s',
};

// Cette fonction est exécutée UNE FOIS au début pour chaque VU (virtual user)
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
  const res = http.get('http://localhost:80/api/v1/stocks/stores/1', {
    headers: {
      Authorization: data.token,
    },
  });

  check(res, {
    'stock fetch succeeded': (r) => r.status === 200,
  });

  const res2 = http.get('http://localhost:80/api/v1/stocks/stores/2', {
    headers: {
      Authorization: data.token,
    },
  });

  check(res2, {
    'stock fetch succeeded': (r) => r.status === 200,
  });

  const res3 = http.get('http://localhost:80/api/v1/stocks/stores/3', {
    headers: {
      Authorization: data.token,
    },
  });

  check(res3, {
    'stock fetch succeeded': (r) => r.status === 200,
  });

  const res4 = http.get('http://localhost:80/api/v1/stocks/stores/4', {
    headers: {
      Authorization: data.token,
    },
  });

  check(res4, {
    'stock fetch succeeded': (r) => r.status === 200,
  });

  const res5 = http.get('http://localhost:80/api/v1/stocks/stores/5', {
    headers: {
      Authorization: data.token,
    },
  });

  check(res5, {
    'stock fetch succeeded': (r) => r.status === 200,
  });

  const res6 = http.get('http://localhost:80/api/v1/stocks/stores/Central', {
    headers: {
      Authorization: data.token,
    },
  });

  check(res6, {
    'stock fetch succeeded': (r) => r.status === 200,
  });

  const res7 = http.get('http://localhost:80/api/v1/sales/stores/1', {
    headers: {
      Authorization: data.token,
    },
  });

  check(res7, {
    'sales fetch succeeded': (r) => r.status === 200,
  });

  const res8 = http.get('http://localhost:80/api/v1/sales/stores/2', {
    headers: {
      Authorization: data.token,
    },
  });

  check(res8, {
    'sales fetch succeeded': (r) => r.status === 200,
  });

  const res9 = http.get('http://localhost:80/api/v1/sales/stores/3', {
    headers: {
      Authorization: data.token,
    },
  });

  check(res9, {
    'sales fetch succeeded': (r) => r.status === 200,
  });

  const res10 = http.get('http://localhost:80/api/v1/sales/stores/4', {
    headers: {
      Authorization: data.token,
    },
  });

  check(res10, {
    'sales fetch succeeded': (r) => r.status === 200,
  });

  const res11 = http.get('http://localhost:80/api/v1/sales/stores/5', {
    headers: {
      Authorization: data.token,
    },
  });

  check(res11, {
    'sales fetch succeeded': (r) => r.status === 200,
  });

  const res12 = http.get('http://localhost:80/api/v1/sales/stores/Central', {
    headers: {
      Authorization: data.token,
    },
  });

  check(res12, {
    'sales fetch succeeded': (r) => r.status === 200,
  });

}