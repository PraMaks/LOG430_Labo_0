import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 50, // utilisateurs simultanés
  duration: '30s',
};

// Cette fonction est exécutée UNE FOIS au début pour chaque VU (virtual user)
export function setup() {
  const loginRes = http.post('http://localhost:3001/api/v1/auth/users/login', JSON.stringify({
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
  const res = http.get('http://localhost:3001/api/v1/standard/stores/1/stock', {
    headers: {
      Authorization: data.token,
    },
  });

  check(res, {
    'stock fetch succeeded': (r) => r.status === 200,
  });

  const res2 = http.get('http://localhost:3001/api/v1/standard/stores/2/stock', {
    headers: {
      Authorization: data.token,
    },
  });

  check(res2, {
    'stock fetch succeeded': (r) => r.status === 200,
  });
}
