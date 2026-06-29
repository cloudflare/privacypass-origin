declare global {
	// values are statically replaced at compile time by esbuild.
	// See scripts/build.js for more information.
	const RELEASE: string;

	interface RsaHashedImportParams extends SubtleCryptoImportKeyAlgorithm {
		hash: string | SubtleCryptoHashAlgorithm;
	}

	interface RsaHashedKeyGenParams extends SubtleCryptoGenerateKeyAlgorithm {
		hash: string | SubtleCryptoHashAlgorithm;
		modulusLength: number;
		publicExponent: ArrayBuffer | ArrayBufferView;
	}
}

export {};
