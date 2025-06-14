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
  const res1 = http.get('http://localhost:80/api/v1/standard/stores/1/stock', {
    headers: { Authorization: data.token },
  });

  check(res1, { 'store 1 stock fetch succeeded': (r) => r.status === 200 });

  const res2 = http.get('http://localhost:80/api/v1/standard/stores/2/stock', {
    headers: { Authorization: data.token },
  });

  check(res2, { 'store 2 stock fetch succeeded': (r) => r.status === 200 });
}
