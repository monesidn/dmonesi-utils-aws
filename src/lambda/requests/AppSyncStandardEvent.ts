export interface AppSyncIdentityInfo {
    /**
     * OpenID claims. These depend on the auth provider.
     */
    claims: Record<string, string>;

    /**
     * For Cognito user pool this attribute holds the default auth
     * strategy that AppSync will use.
     */
    defaultAuthStrategy?: 'ALLOW' | 'DENY';

    /**
     * User groups
     */
    groups?: string[];

    /**
     * Token issuer URL.
     */
    issuer: string;

    /**
     * Request source IP. Don't know why it is an array.
     */
    sourceIp: string[];

    /**
     * The UUID of the authenticated user.
     */
    sub: string;

    /**
     * Auth username. This is usually a UUID.
     */
    username: string;

}

export interface AppSyncRequestInfo {
    /**
     * Request headers.
     */
    headers: Record<string, string>;
}

export interface AppSyncInfo {
    /**
     * Requested GraphQL field.
     */
    fieldName: string;

    /**
     * Name of the object holding the fieldName. Usually it is "Query" or "Mutation".
     */
    parentTypeName: string;

    /**
     * ???
     */
    variables: Record<string, string>;
}


export interface AppSyncStandardEventContext<Arguments> {
    /**
     * Map containing the endpoint arguments.
     */
    arguments: Arguments;

    /**
     * Identity info. The exact shape of this object depends on the ID provider.
     */
    identity: AppSyncIdentityInfo;

    /**
     * ???
     */
    source?: any;

    /**
     * Query result. This is null if we are resolving the first query.
     */
    result: any;

    /**
     * ???
     */
    domainName?: any;

    /**
     * ???
     */
    error?: any;

    /**
     * ???
     */
    prev?: any;

    /**
     *  ???
     */
    subscriptionFilter?: any;

    /**
     *  ???
     */
    subscriptionInvalidationFilter?: any;

    /**
     *  ???
     */
    stash?: any;

    /**
     *  ???
     */
    outErrors?: any;

}

/**
 * Standard AppSync request typing when a lambda is involved.
 */
export interface AppSyncStandardEvent<Arguments = Record<string, string | number | boolean>> {

    /**
     * Field containing the invoked field. While not strictly required this
     * field is used in all examples.
     */
    field: string;

    /**
     * Where the real info are stored.
     */
    context: AppSyncStandardEventContext<Arguments>;
}
