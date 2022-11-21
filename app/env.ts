try {
  require('dotenv-vault-core').config({ path: '../.env' });
} catch (e) {
  console.warn('Failed to configure dotenv-vault-core', e);
}
