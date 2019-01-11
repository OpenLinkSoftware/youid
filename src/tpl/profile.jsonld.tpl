{
    "@context": {
        "owl": "http://www.w3.org/2002/07/owl#", 
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#", 
        "oplcert": "http://www.openlinksw.com/schemas/cert#", 
        "cert": "http://www.w3.org/ns/auth/cert#", 
        "foaf": "http://xmlns.com/foaf/0.1/", 
        "xhv": "http://www.w3.org/1999/xhtml/vocab#", 
        "xsd": "http://www.w3.org/2001/XMLSchema#", 
        "oplcert:signature": {
            "@type": "@id"
        }, 
        "oplcert:hasCertificate": {
            "@type": "@id"
        }, 
        "owl:sameAs": {
            "@type": "@id"
        }, 
        "oplcert:owns": {
            "@type": "@id"
        }, 
        "foaf:page": {
            "@type": "@id"
        }, 
        "foaf:mbox": {
            "@type": "@id"
        }, 
        "foaf:primaryTopic": {
            "@type": "@id"
        }, 
        "xhv:alternate": {
            "@type": "@id"
        }, 
        "oplcert:SAN": {
            "@type": "@id"
        }, 
        "cert:key": {
            "@type": "@id"
        }, 
        "oplcert:hasPublicKey": {
            "@type": "@id"
        }
    }, 

  "@graph": [
    {
      "@id": "%{jsonld_prof_url}#identity",
      "cert:key": "%{jsonld_pubkey_url}#PublicKey"
    },
    {
      "@id": "%{jsonld_pubkey_url}#PublicKey",
      "@type": "cert:RSAPublicKey",
      "cert:exponent": {
          "@value": "%{exponent}",
          "@type": "xsd:int"
      },
      "cert:modulus": {
          "@value": "%{modulus}",
          "@type": "xsd:hexBinary"
      }
    },
    {
      "@id": "%{jsonld_prof_url}",
      "@type": ["oplcert:Certificate", "foaf:profileDocument"],
      "rdfs:label": "Profile Document Subject: %{subj_name}",
      "foaf:primaryTopic": [ 
          "%{jsonld_prof_url}#identity"
      ],
      "oplcert:SAN": "%{jsonld_prof_url}#identity",
      "oplcert:hasPublicKey": "%{jsonld_pubkey_url}#PublicKey",
      "cert:key": "%{jsonld_pubkey_url}#PublicKey"
    },
    {
      "@id": "%{jsonld_cert_url}#cert",
      "@type": "oplcert:Certificate",
      "oplcert:fingerprint": "%{fingerprint}",
      "oplcert:fingerprint-digest": "%{fingerprint-digest}",
      "oplcert:serial": "%{serial}",
      "oplcert:notBefore": {
        "@value": "%{date_before}",
        "@type": "xsd:dateTime"
      },
      "oplcert:notAfter": {
        "@value": "%{date_after}",
        "@type": "xsd:dateTime"
      },
      "oplcert:issuer": "%{issuer}",
      "oplcert:signature": "%{signature}",
      "oplcert:subject": "%{subject}",
      "oplcert:hasPublicKey": "%{jsonld_pubkey_url}#PublicKey",
      %{ian}
      "oplcert:SAN": "%{jsonld_prof_url}#identity"
    },

    {
      "@id": "%{jsonld_prof_url}#identity",
      "@type": "foaf:Agent",
      %{pdp_add}
      "xhv:alternate": [
          "%{rdfa_prof_url}#identity",
          "%{prof_url}#identity",
          "%{card_url}#identity"
      ],
      "oplcert:hasCertificate": "%{jsonld_cert_url}#cert",
      "oplcert:owns": "%{jsonld_cert_url}#cert",
      "owl:sameAs": [
        "%{rdfa_prof_url}#identity",
        "%{prof_url}#identity",
        "%{card_url}#identity"
      ]
    }
  ]
}
