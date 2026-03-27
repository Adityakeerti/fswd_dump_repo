#!/usr/bin/env python3
"""
Generate self-signed SSL certificates for development.
This allows HTTPS which is required for camera access on mobile devices.
"""

import datetime
import os
import ipaddress

try:
    from cryptography import x509
    from cryptography.x509.oid import NameOID, ExtensionOID
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.backends import default_backend
except ImportError:
    print("ERROR: cryptography library not installed")
    print("Install it with: pip install cryptography")
    exit(1)

def generate_self_signed_cert():
    """Generate a self-signed certificate for localhost with mobile compatibility."""
    
    print("=" * 60)
    print("Generating SSL Certificates (Mobile Compatible)")
    print("=" * 60)
    print()
    
    # Generate private key with 2048 bits (more compatible than 4096)
    print("Generating private key...")
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )
    
    # Generate certificate
    print("Generating certificate...")
    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, "US"),
        x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, "State"),
        x509.NameAttribute(NameOID.LOCALITY_NAME, "City"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Pustak Tracker"),
        x509.NameAttribute(NameOID.COMMON_NAME, "10.35.80.59"),
    ])
    
    # Build certificate with mobile-friendly settings
    cert_builder = x509.CertificateBuilder().subject_name(
        subject
    ).issuer_name(
        issuer
    ).public_key(
        private_key.public_key()
    ).serial_number(
        x509.random_serial_number()
    ).not_valid_before(
        datetime.datetime.utcnow()
    ).not_valid_after(
        datetime.datetime.utcnow() + datetime.timedelta(days=365)
    )
    
    # Add Subject Alternative Names (required for modern browsers)
    cert_builder = cert_builder.add_extension(
        x509.SubjectAlternativeName([
            x509.DNSName("localhost"),
            x509.DNSName("*.localhost"),
            x509.IPAddress(ipaddress.IPv4Address("127.0.0.1")),
            x509.IPAddress(ipaddress.IPv4Address("10.35.80.59")),
        ]),
        critical=False,
    )
    
    # Add Basic Constraints
    cert_builder = cert_builder.add_extension(
        x509.BasicConstraints(ca=True, path_length=0),
        critical=True,
    )
    
    # Add Key Usage
    cert_builder = cert_builder.add_extension(
        x509.KeyUsage(
            digital_signature=True,
            key_encipherment=True,
            key_cert_sign=True,
            key_agreement=False,
            content_commitment=False,
            data_encipherment=False,
            crl_sign=False,
            encipher_only=False,
            decipher_only=False,
        ),
        critical=True,
    )
    
    # Add Extended Key Usage
    cert_builder = cert_builder.add_extension(
        x509.ExtendedKeyUsage([
            x509.oid.ExtendedKeyUsageOID.SERVER_AUTH,
            x509.oid.ExtendedKeyUsageOID.CLIENT_AUTH,
        ]),
        critical=False,
    )
    
    # Sign certificate with SHA256 (most compatible)
    cert = cert_builder.sign(private_key, hashes.SHA256(), backend=default_backend())
    
    # Write private key
    print("Writing key.pem...")
    with open("key.pem", "wb") as f:
        f.write(private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption()
        ))
    
    # Write certificate
    print("Writing cert.pem...")
    with open("cert.pem", "wb") as f:
        f.write(cert.public_bytes(serialization.Encoding.PEM))
    
    print()
    print("=" * 60)
    print("Certificates generated successfully!")
    print("=" * 60)
    print()
    print("Files created:")
    print("  - cert.pem (Certificate)")
    print("  - key.pem (Private Key)")
    print()
    print("Certificate Details:")
    print(f"  - Valid for: 365 days")
    print(f"  - Algorithm: RSA 2048-bit")
    print(f"  - Hash: SHA256")
    print(f"  - Common Name: 10.35.80.59")
    print()
    print("IMPORTANT: Restart backend and frontend servers!")
    print("  Backend: cd backend && python run.py")
    print("  Frontend: cd frontend && npm run dev")
    print()

if __name__ == "__main__":
    try:
        generate_self_signed_cert()
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        print()
        print("Alternative: Use OpenSSL command:")
        print("openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes -subj '/CN=10.35.80.59'")
