export namespace main {
	
	export class SidecarStatus {
	    ok: boolean;
	    python: string;
	    version?: string;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new SidecarStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ok = source["ok"];
	        this.python = source["python"];
	        this.version = source["version"];
	        this.error = source["error"];
	    }
	}

}

export namespace store {
	
	export class User {
	    id: string;
	    email: string;
	    display_name: string;
	    avatar_uri?: string;
	    created_at: string;
	
	    static createFrom(source: any = {}) {
	        return new User(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.email = source["email"];
	        this.display_name = source["display_name"];
	        this.avatar_uri = source["avatar_uri"];
	        this.created_at = source["created_at"];
	    }
	}

}

