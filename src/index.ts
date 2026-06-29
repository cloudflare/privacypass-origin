import {
	AuthorizationHeader,
	PRIVATE_TOKEN_ISSUER_DIRECTORY,
	TOKEN_TYPES,
	WWWAuthenticateHeader,
	publicVerif,
} from '@cloudflare/privacypass-ts';
import type { IssuerConfig } from '@cloudflare/privacypass-ts';

import originHTML from './origin-html.js';
import tokenOKHTML from './origin-html-to-remove-token-ok.js';
import type { Bindings } from './bindings.js';

const { BlindRSAMode, Origin, convertRSASSAPSSToEnc } = publicVerif;

export default {
	async fetch(request: Request, env: Bindings) {
		return handleRequest(request, env);
	},
};

function generateFetchIssuerEndpoint(
	env: Bindings
): (input: RequestInfo, info?: RequestInit) => Promise<Response> {
	return (input: RequestInfo, info?: RequestInit) => {
		if (env.ISSUER) {
			return env.ISSUER.fetch(input, info);
		}
		return fetch(input, info);
	};
}

function base64UrlToUint8Array(base64Url: string): Uint8Array {
	const base64 = base64Url
		.replace(/^"/, '')
		.replace(/"$/, '')
		.replace(/-/g, '+')
		.replace(/_/g, '/');
	const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

	return Uint8Array.from(atob(padded), c => c.charCodeAt(0));
}

function equalBytes(a: Uint8Array, b: Uint8Array): boolean {
	if (a.length !== b.length) {
		return false;
	}

	let diff = 0;
	for (let i = 0; i < a.length; i++) {
		diff |= a[i] ^ b[i];
	}
	return diff === 0;
}

/**
 * Fetch public keys and identifiers from the designated Privacy Pass issuer service.
 * @param {String} issuerURL
 * @returns a list with three ArrayBuffer elements
 */
async function fetchBasicIssuerKeys(env: Bindings, issuerURL: string) {
	// Fetch the issuer configuration
	const init = {
		headers: {
			'content-type': 'application/json',
		},
	};
	const configURL = `${issuerURL}${PRIVATE_TOKEN_ISSUER_DIRECTORY}`;
	const configResponse = await generateFetchIssuerEndpoint(env)(configURL, init);
	const config: IssuerConfig = await configResponse.json();

	// Parse out the token keys (in legacy format too)
	const token = config['token-keys'].find(
		token => token['token-type'] === TOKEN_TYPES.BLIND_RSA.value
	);

	if (!token) {
		throw new Error('Could not find BlindRSA token key on issuer');
	}

	const clientRequestKeyEnc = base64UrlToUint8Array(token['token-key']);

	return clientRequestKeyEnc;
}

async function issuerKeys(env: Bindings): Promise<[CryptoKey, Uint8Array]> {
	// Fetch issuer keys
	const clientRequestKeyEnc = await fetchBasicIssuerKeys(env, env.ISSUER_URL);
	const spkiEnc = convertRSASSAPSSToEnc(clientRequestKeyEnc);
	// Import the public key that we'll use for verification
	const tokenKey = await crypto.subtle.importKey(
		'spki',
		spkiEnc,
		{
			name: 'RSA-PSS',
			hash: { name: 'SHA-384' },
		},
		false,
		['verify']
	);

	return [tokenKey, clientRequestKeyEnc];
}

function tokenVerificationFailed(): Response {
	return new Response('Token verification failed', {
		headers: {
			'content-type': 'text/html;charset=UTF-8',
		},
		status: 400,
	});
}

function malformedAuthorizationHeader(): Response {
	return new Response('Malformed Authorization header', {
		headers: {
			'content-type': 'text/html;charset=UTF-8',
		},
		status: 400,
	});
}

async function handleLogin(request: Request, env: Bindings) {
	let tokenKey: CryptoKey;
	let clientRequestKeyEnc: Uint8Array;
	try {
		[tokenKey, clientRequestKeyEnc] = await issuerKeys(env);
	} catch (err) {
		return new Response('Failure to decode token verification key. ' + err, { status: 404 });
	}

	const fixedRedemptionContext = new Uint8Array(32);
	fixedRedemptionContext.fill(0xfe);
	const issuerName = new URL(env.ISSUER_URL).host;
	const origin = new Origin(BlindRSAMode.PSS, [env.ORIGIN_NAME]);
	const challenge = origin.createTokenChallenge(issuerName, fixedRedemptionContext);
	const privateToken = new WWWAuthenticateHeader(challenge, clientRequestKeyEnc, 10);

	const authorizationHeader = request.headers.get('Authorization');
	if (authorizationHeader) {
		let authorizations: AuthorizationHeader[];
		try {
			authorizations = AuthorizationHeader.parse(TOKEN_TYPES.BLIND_RSA, authorizationHeader);
		} catch {
			return malformedAuthorizationHeader();
		}

		if (authorizations.length === 0) {
			return malformedAuthorizationHeader();
		}

		const expectedChallengeDigest = new Uint8Array(
			await crypto.subtle.digest('SHA-256', challenge.serialize())
		);
		for (const authorization of authorizations) {
			if (!equalBytes(authorization.token.authInput.challengeDigest, expectedChallengeDigest)) {
				continue;
			}

			if (await origin.verify(authorization.token, tokenKey)) {
				return new Response(tokenOKHTML(env), {
					headers: {
						'content-type': 'text/html;charset=UTF-8',
					},
					status: 200,
				});
			}
		}

		return tokenVerificationFailed();
	}

	return new Response(originHTML(env), {
		headers: {
			'content-type': 'text/html;charset=UTF-8',
			'WWW-Authenticate': privateToken.toString(),
		},
		status: 401,
	});
}

/**
 * Handle a request to the demo Privacy Pass redemption server.
 * @param {Request} request
 */
async function handleRequest(request: Request, env: Bindings) {
	// If the request is for the home page, return the basic interaction form.
	const url = new URL(request.url);

	if (url.pathname.startsWith('/login')) {
		return handleLogin(request, env);
	}

	return new Response('Unsupported resource', {
		headers: {
			'content-type': 'text/html;charset=UTF-8',
		},
		status: 400,
	});
}
