# privacypass-origin

This Worker implements the [challenge](https://ietf-wg-privacypass.github.io/base-drafts/draft-ietf-privacypass-auth-scheme.html#name-token-challenge) and [redemption](https://ietf-wg-privacypass.github.io/base-drafts/draft-ietf-privacypass-auth-scheme.html#name-token-redemption) protocols in Privacy Pass. A live demonstration of this worker can be found [here](https://demo-pat.research.cloudflare.com/login). 

## Overview

The test server has two HTTP endpoints:

- `GET /login`: This API will return a static HTML page representing the application, which is a simple (and non-functional) login form. It also returns a `WWW-Authenticate: PrivateToken` challenge as defined by [Privacy Pass authentication](https://datatracker.ietf.org/doc/draft-ietf-privacypass-auth-scheme/).
- `GET /login (+Authorization: PrivateToken)`: This API is used by the application for performing a "login" request. Clients will interact with this API upon submitting the login form details. 
    - If the login request contains a Privacy Pass token, the token is validated before accepting the request.
    - If not, it's the request above.

When verifying Privacy Pass tokens, the server will first fetch the token verification key from the issuer (as identified by `ISSUER_NAME`).

That's it!

## Configuration

To deploy and interact with this test server, you need to configure the following Cloudflare Worker variables:

- ISSUER_NAME: This is the name of the Privacy Pass issuer server that the origin trusts for issuing tokens. This is a public variable.

## Dependencies

The test server uses existing APIs for creating Privacy Pass token challenges and verifying the resulting tokens. For example, when verifying a token, one can use [standard WebCrypto APIs](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/verify) for verifying the Token signature against the Issuer's public key.
