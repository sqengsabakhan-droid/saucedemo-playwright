// Credentials can be overridden with environment variables.
const user = {
  username: process.env.SAUCE_USERNAME || 'standard_user',
  password: process.env.SAUCE_PASSWORD || 'secret_sauce',
};

// Products are referenced by their visible names, not by position in the list.
const products = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];

const customer = { firstName: 'Saba', lastName: 'Khan', postalCode: '46000' };

module.exports = { user, products, customer };
