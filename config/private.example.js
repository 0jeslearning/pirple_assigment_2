const vendors = {}
vendors.development = {
    hashingSecret: 'this_is_a_Secret',
    stripe: {
      hostUrl: 'api.stripe.com',
      chargePath: '/v1/charges',
      secretKey: 'YOUR_STRIPE_SECRET_KEY',
      publicKey: 'YOUR_STRIPE_PUBLISHABLE'
    },
    mailgun: {
        protocol: 'https:',
        port: 443,
        from: 'YOUR_EMAIL',
        hostUrl: 'api.mailgun.net',
        path: '/v3/YOUR_DOMAIN_NAME.mailgun.org/messages',
        secretKey: 'YOUR_MAILGUN_API_KEY',
    }
}

vendors.production = {
    hashingSecret: 'this_is_a_Secret',
    stripe: {
      hostUrl: 'api.stripe.com',
      chargePath: '/v1/charges',
      secretKey: 'YOUR_STRIPE_SECRET_KEY',
      publicKey: 'YOUR_STRIPE_PUBLISHABLE'
    },
    mailgun: {
        protocol: 'https:',
        port: 443,
        from: 'YOUR_EMAIL',
        hostUrl: 'api.mailgun.net',
        path: '/v3/YOUR_DOMAIN_NAME.mailgun.org/messages',
        secretKey: 'YOUR_MAILGUN_API_KEY',
    }
}


module.exports = vendors