import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        sid?: string;
        org_id?: string;
        roles_mask?: string;
        token_version?: number;
        revoked?: boolean;
        user: {
            id?: string;
            email?: string | null;
            name?: string | null;
            org_id?: string;
            roles_mask?: string;
        };
    }

    interface User {
        id?: string;
        org_id?: string;
        roles_mask?: string;
        token_version?: number;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        sid?: string;
        org_id?: string;
        roles_mask?: string;
        token_version?: number;
        revoked?: boolean;
    }
}
