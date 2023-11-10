export interface Bindings {
	// variables and secrets
	ENVIRONMENT: string;
	ISSUER_URL: string;
	ORIGIN_NAME: string;

	// Service Bindings
	ISSUER: Fetcher;
}
