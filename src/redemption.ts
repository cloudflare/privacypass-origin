function ctEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.length !== b.length || a.length === 0) {
		return false;
	}
	const n = a.length;
	let c = 0;
	for (let i = 0; i < n; i++) {
		c |= a[i as number] ^ b[i as number];
	}
	return c === 0;
}

export function base64UrlToUint8Array(base64Url: string): Uint8Array {
	// Convert URL escaped characters to regular base64 string
	const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

	return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

/**
 * Verify a token carried in an `Authorization` header using the provided token public key, according to:
 *    https://ietf-wg-privacypass.github.io/base-drafts/draft-ietf-privacypass-auth-scheme.html#name-token-redemption
 * @returns true if the token is well-formed and valid, and false otherwise
 */
export async function verifyToken(authenticator: string, tokenKey: CryptoKey, context: Uint8Array) {
	try {
		// struct {
		//     uint16_t token_type;
		//     uint8_t nonce[32];
		//     uint8_t context[32];
		//     uint8_t token_key_id[Nid];
		//     uint8_t authenticator[Nk];
		// } Token;
		const tokenValueEnc = authenticator.split('=')[1]; // take the value after '='
		const tokenValue = base64UrlToUint8Array(tokenValueEnc);

		// Check to see if Token.context matches one of the expected context values
		const tokenBytesOffset = 2 + 32; // token_type(2) + nonce(32*1)
		if (!ctEqual(tokenValue.slice(tokenBytesOffset, tokenBytesOffset + context.length), context)) {
			console.log('Token context mismatch');
			return false;
		}

		// Split out the signatnure and verify it
		const signatureInput = tokenValue.slice(0, tokenValue.byteLength - 256); // Remove the signature
		const signature = tokenValue.slice(tokenValue.byteLength - 256, tokenValue.byteLength);

		// Verify the Token authenticator using standard cryptographic APIs.
		return await crypto.subtle.verify(
			{
				name: 'RSA-PSS',
				saltLength: 48,
			},
			tokenKey,
			signature,
			signatureInput
		);
	} catch (err) {
		console.log("Token verification failed", err)
		return false;
	}
}
