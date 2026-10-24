import * as aws from "@pulumi/aws";

const orgName = "Pulumi Workshop";

// Root CA: self-signed through the CA's own CSR.
const rootCa = new aws.acmpca.CertificateAuthority("root", {
    type: "ROOT",
    certificateAuthorityConfiguration: {
        keyAlgorithm: "RSA_4096",
        signingAlgorithm: "SHA512WITHRSA",
        subject: { commonName: "workshop-root-ca", organization: orgName },
    },
    permanentDeletionTimeInDays: 7, // shortest allowed, keeps the cleanup window small
});

const rootCert = new aws.acmpca.Certificate("root", {
    certificateAuthorityArn: rootCa.arn,
    certificateSigningRequest: rootCa.certificateSigningRequest,
    signingAlgorithm: "SHA512WITHRSA",
    templateArn: "arn:aws:acm-pca:::template/RootCACertificate/V1",
    validity: { type: "YEARS", value: "10" },
});

const rootActive = new aws.acmpca.CertificateAuthorityCertificate("root", {
    certificateAuthorityArn: rootCa.arn,
    certificate: rootCert.certificate,
    certificateChain: rootCert.certificateChain,
});

// Subordinate CA: signed by the root. This is the CA cert-manager issues from.
const subordinateCa = new aws.acmpca.CertificateAuthority("subordinate", {
    type: "SUBORDINATE",
    certificateAuthorityConfiguration: {
        keyAlgorithm: "RSA_2048",
        signingAlgorithm: "SHA256WITHRSA",
        subject: { commonName: "workshop-subordinate-ca", organization: orgName },
    },
    permanentDeletionTimeInDays: 7,
});

const subordinateCert = new aws.acmpca.Certificate("subordinate", {
    certificateAuthorityArn: rootCa.arn,
    certificateSigningRequest: subordinateCa.certificateSigningRequest,
    signingAlgorithm: "SHA512WITHRSA",
    templateArn: "arn:aws:acm-pca:::template/SubordinateCACertificate_PathLen0/V1",
    validity: { type: "YEARS", value: "5" },
}, { dependsOn: [rootActive] }); // the root must be ACTIVE before it can sign

const subordinateActive = new aws.acmpca.CertificateAuthorityCertificate("subordinate", {
    certificateAuthorityArn: subordinateCa.arn,
    certificate: subordinateCert.certificate,
    certificateChain: subordinateCert.certificateChain,
});

// The ARNs come from the CertificateAuthorityCertificate resources, so a consumer
// of these outputs waits until the CA is ACTIVE.
export const rootCaArn = rootActive.certificateAuthorityArn;
export const subordinateCaArn = subordinateActive.certificateAuthorityArn;
