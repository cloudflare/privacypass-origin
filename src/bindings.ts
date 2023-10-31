export interface Bindings {
	// variables and secrets
	ENVIRONMENT: string;
	ISSUER_NAME: string;
	ORIGIN_NAME: string;

	// Service Bindings
	ISSUER: Fetcher;
}
