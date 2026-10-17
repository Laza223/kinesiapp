// Defaults de la base de test (los mismos de .env.test.example y de CI).
process.env.DATABASE_URL ??= 'postgres://kinesiapp_app:local_app_pw@127.0.0.1:54322/kinesiapp_test'
process.env.TEST_ADMIN_DATABASE_URL ??=
  'postgres://postgres:postgres@127.0.0.1:54322/kinesiapp_test'
process.env.DATABASE_POOL_MAX ??= '1'
