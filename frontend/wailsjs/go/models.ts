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

