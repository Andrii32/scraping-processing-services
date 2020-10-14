export interface Failure {
    name:         string
    description?: string
};

export interface RemoteAddress {
    ip:   string
    port: number
};

export interface Status {
    code:   number
    text:   string
};

export interface CertificateDetails{
    subject:  string
    issuer:   string
    valid_fr: number
    valid_to: number
    protocol: string
}

export interface Downloaded {
    id:               string
    timestamp:        string
    input_url:        string
    request_urls?:    string[]
    response_url?:    string
    status?:          Status
    headers?:         string
    content?:         string
    remote_address?:  RemoteAddress
    certificate?:     CertificateDetails
    failure?:         Failure
};


