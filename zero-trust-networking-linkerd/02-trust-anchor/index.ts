import * as tls from "@pulumi/tls";

// Step 2: the mesh's own root of trust, generated as Pulumi code instead of
// by hand-running `step` or `openssl` (the two paths the Linkerd docs
// describe for self-managed certificates:
// https://linkerd.io/docs/tasks/generate-certificates/, read 2026-09-25).
//
// The trust anchor is a self-signed CA. Its common name matches the Linkerd
// docs' own example (`root.linkerd.cluster.local`) and its key is ECDSA
// P-256, the curve Linkerd's own `step` walkthrough produces by default.
const trustAnchorKey = new tls.PrivateKey("identity-trust-anchor-key", {
    algorithm: "ECDSA",
    ecdsaCurve: "P256",
});

// Validity: 87600h (10 years), the same "longer-lived trust anchor" duration
// the Linkerd docs show as their own `--not-after` example. A 90-minute
// workshop needs nothing close to this; matching the documented convention
// beats inventing a shorter number that would only need to be justified.
const trustAnchor = new tls.SelfSignedCert("identity-trust-anchor", {
    privateKeyPem: trustAnchorKey.privateKeyPem,
    isCaCertificate: true,
    subject: {
        commonName: "root.linkerd.cluster.local",
    },
    validityPeriodHours: 87600,
    allowedUses: [
        "cert_signing",
        "crl_signing",
        "key_encipherment",
        "digital_signature",
    ],
});

// Step 2 continued: the issuer certificate the control plane's identity
// service uses to sign each meshed proxy's own CSR. Its common name
// (`identity.linkerd.cluster.local`) is what the identity service expects;
// this is not a free choice.
const issuerKey = new tls.PrivateKey("identity-issuer-key", {
    algorithm: "ECDSA",
    ecdsaCurve: "P256",
});

const issuerRequest = new tls.CertRequest("identity-issuer-request", {
    privateKeyPem: issuerKey.privateKeyPem,
    subject: {
        commonName: "identity.linkerd.cluster.local",
    },
});

// Validity: 8760h (1 year), the Linkerd docs' own example for the issuer
// certificate. Signed by the trust anchor generated above, so the whole
// chain — root through issuer — is Pulumi-managed code, not a file someone
// ran `step` against on their laptop.
const issuerCert = new tls.LocallySignedCert("identity-issuer", {
    certRequestPem: issuerRequest.certRequestPem,
    caPrivateKeyPem: trustAnchorKey.privateKeyPem,
    caCertPem: trustAnchor.certPem,
    isCaCertificate: true,
    validityPeriodHours: 8760,
    allowedUses: [
        "cert_signing",
        "crl_signing",
        "key_encipherment",
        "digital_signature",
    ],
});

// Exported for 03-control-plane to consume via StackReference: the
// linkerd-control-plane Helm chart's `identityTrustAnchorsPEM`,
// `identity.issuer.tls.crtPEM` and `identity.issuer.tls.keyPEM` values
// (https://linkerd.io/docs/tasks/install-helm/, read 2026-09-25).
export const trustAnchorPem = trustAnchor.certPem;
export const issuerCertPem = issuerCert.certPem;
export const issuerKeyPem = issuerKey.privateKeyPem;
