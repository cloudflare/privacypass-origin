import {
	IssuerConfig,
	PRIVATE_TOKEN_ISSUER_DIRECTORY,
	PrivateToken,
	TOKEN_TYPES,
	Token,
	TokenChallenge,
	util,
} from '@cloudflare/privacypass-ts';
import { base64UrlToUint8Array, verifyToken } from './redemption.js';

import originHTML from './origin-html.js';
import tokenOKHTML from './origin-html-to-remove-token-ok.js';
import { Bindings } from './bindings.js';

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
		token => token['token-type'] == TOKEN_TYPES.BLIND_RSA.value
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
	const spkiEnc = util.convertRSASSAPSSToEnc(clientRequestKeyEnc);
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

async function handleLogin(request: Request, env: Bindings) {
	const tokenType = TOKEN_TYPES.BLIND_RSA;
	let tokenKey, clientRequestKeyEnc;
	try {
		[tokenKey, clientRequestKeyEnc] = await issuerKeys(env);
	} catch (err) {
		return new Response('Failure to decode token verification key. ' + err, { status: 404 });
	}

	const fixedRedemptionContext = new Uint8Array(32);
	fixedRedemptionContext.fill(0xfe);
	const issuerName = new URL(env.ISSUER_URL).host
	const challenge = new TokenChallenge(tokenType.value, issuerName, fixedRedemptionContext, [
		env.ORIGIN_NAME,
	]);
	const privateToken = new PrivateToken(challenge, clientRequestKeyEnc, 10);

	// If the request is for the /login resource, check to see if the request
	// has the WWW-Authenticate header carrying a token.
	const authenticator = request.headers.get('Authorization') ?? '';
	if (authenticator.startsWith('PrivateToken token=')) {
		const tokenChallenge = challenge.serialize();
		const context = new Uint8Array(await crypto.subtle.digest('SHA-256', tokenChallenge));
		const token = Token.parse(tokenType, authenticator)[0];
		token.verify(tokenKey);
		const valid = await verifyToken(authenticator, tokenKey, context);
		if (valid) {
			return new Response(tokenOKHTML(env), {
				headers: {
					'content-type': 'text/html;charset=UTF-8',
				},
				status: 200,
			});
		}
		return new Response('Token verification failed', {
			headers: {
				'content-type': 'text/html;charset=UTF-8',
			},
			status: 400,
		});
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
