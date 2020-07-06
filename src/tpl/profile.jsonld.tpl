[
    {
      "@id": "%{jsonld_prof_url}#identity",
      "http://www.w3.org/ns/auth/cert#key": {
        "@id": "%{jsonld_pubkey_url}#PublicKey"
      }
    },
    {
      "@id": "%{jsonld_pubkey_url}#PublicKey",
      "@type": "http://www.w3.org/ns/auth/cert#RSAPublicKey",
      "http://www.w3.org/ns/auth/cert#exponent": {
        "@type": "http://www.w3.org/2001/XMLSchema#int",
        "@value": "%{exponent}"
      },
      "http://www.w3.org/ns/auth/cert#modulus": {
        "@type": "http://www.w3.org/2001/XMLSchema#hexBinary",
        "@value": "%{modulus}"
      }
    },

    {
      "@id": "%{jsonld_prof_url}#identity",
      "http://www.openlinksw.com/schemas/cert#hasCertificate": {
        "@id": "%{jsonld_cert_url}#cert"
      }
    },

    {
      "@id": "%{jsonld_cert_url}#cert",
      "@type": "http://www.openlinksw.com/schemas/cert#Certificate",
      "http://www.openlinksw.com/schemas/cert#fingerprint": "%{fingerprint}",
      "http://www.openlinksw.com/schemas/cert#fingerprint-digest": "%{fingerprint-digest}",
      "http://www.openlinksw.com/schemas/cert#subject": "%{subject}",
      "http://www.openlinksw.com/schemas/cert#issuer": "%{issuer}",
      "http://www.openlinksw.com/schemas/cert#notBefore": {
        "@type": "http://www.w3.org/2001/XMLSchema#dateTime",
        "@value": "%{date_before}"
      },
      "http://www.openlinksw.com/schemas/cert#notAfter": {
        "@type": "http://www.w3.org/2001/XMLSchema#dateTime",
        "@value": "%{date_after}"
      },
      "http://www.openlinksw.com/schemas/cert#serial": "%{serial}",
!{ca_cert_url}      "http://www.openlinksw.com/schemas/cert#IAN": { "@id" : "%{ca_cert_url}"},
      "http://www.openlinksw.com/schemas/cert#SAN": {
        "@id": "%{jsonld_prof_url}#identity"
      },
      "http://www.openlinksw.com/schemas/cert#hasPublicKey": {
        "@id": "%{jsonld_pubkey_url}#PublicKey"
      },
      "http://www.openlinksw.com/schemas/cert#signature": {
        "@id": "%{signature}"
      }
    },

!!{pdp_url}
    {
      "@id": "%{pdp_url}",
      "@type": "http://schema.org/Person",
      "http://www.openlinksw.com/schemas/cert#owns": {
        "@id": "%{jsonld_cert_url}#cert"
      },
      "http://schema.org/sameAs": {
        "@id": "%{jsonld_prof_url}"
      }
    },

    {
      "@id": "%{jsonld_prof_url}#identity",
      "@type": [
        "http://schema.org/CreativeWork",
        "http://www.openlinksw.com/schemas/cert#Certificate",
        "http://schema.org/WebPage"
      ],
      "http://schema.org/additionalType": [
        {
          "@id": "http://www.openlinksw.com/schemas/cert#Certificate"
        },
        {
          "@id": "http://schema.org/CreativeWork"
        },
        {
          "@id": "http://schema.org/WebPage"
        }
      ],
      "http://schema.org/url": {
        "@id": "#this"
      },
      "http://schema.org/name": "%{subj_name}",
      "http://schema.org/author": {
        "@id": "%{jsonld_prof_url}#identity"
      },
      "http://schema.org/mainEntity": {
        "@id": "%{jsonld_prof_url}#identity"
      },
      "http://www.openlinksw.com/schemas/cert#SAN": {
        "@id": "%{jsonld_prof_url}#identity"
      },
      "http://www.openlinksw.com/schemas/cert#hasPublicKey": {
        "@id": "%{jsonld_pubkey_url}#PublicKey"
      },
      "http://www.w3.org/ns/auth/cert#key": {
        "@id": "%{jsonld_pubkey_url}#PublicKey"
      }
    },

    {
      "@id": "%{jsonld_prof_url}#identity",
      "http://schema.org/isRelatedTo": [
        {
          "@id": "%{card_url}#identity"
        },
        {
          "@id": "%{rdfa_prof_url}#identity"
        },
        {
          "@id": "%{prof_url}#identity"
        }
      ]
    },

    {
      "@id": "%{card_url}#identity",
      "http://www.w3.org/2002/07/owl#sameAs": [
        {
          "@id": "%{jsonld_prof_url}#identity"
        },
        {
          "@id": "%{rdfa_prof_url}#identity"
        },
        {
          "@id": "%{prof_url}#identity"
        }
      ]
    },

    {
      "@id": "%{jsonld_prof_url}#identity",
      "http://schema.org/isRelatedTo": {
        "@id": "%{jsonld_cert_url}#cert"
      }
    },

    {
      "@id": "%{card_url}",
      "@type": "http://schema.org/WebPage",
      "http://schema.org/mainEntity": {
        "@id": "%{card_url}#identity"
      }
    },

    {
      "@id": "%{card_url}#identity",
      "@type": "http://schema.org/Person",
!{subj_email}      "http://schema.org/email": "%{subj_email}",
!{subj_email}      "http://xmlns.com/foaf/0.1/mbox": {  "@id": "mailto:%{subj_email}"  },
      "http://schema.org/worksFor": {
        "@type": "http://schema.org/Organization",
        "http://schema.org/name": "%{subj_org}"
      },
      "http://schema.org/address": {
        "@type": "http://schema.org/Place",
!{subj_country}        "http://schema.org/addressCountry": "%{subj_country}",
!{subj_state}        "http://schema.org/addressRegion": "%{subj_state}"

      },
      "http://schema.org/name": "%{subj_name}",
      "http://www.w3.org/2002/07/owl#sameAs": {
        "@id": "%{pdp_url}#this"
      },
      "http://schema.org/sameAs": {
        "@id": "%{pdp_url}"
      }
    },

    {
      "@id": "%{prof_url}#identity",
      "@type": "http://schema.org/Person",
      "http://schema.org/sameAs": [
        {
          "@id": "%{rdfa_prof_url}"
        },
        {
          "@id": "%{card_url}"
        },
        {
          "@id": "%{jsonld_prof_url}"
        }
      ]
    }
!!.

!!{pdp_mail}
    {
      "@id": "%{jsonld_prof_url}#identity",
      "@type": "http://xmlns.com/foaf/0.1/Agent",
      "http://xmlns.com/foaf/0.1/mbox": {
        "@id": "mailto:%{pdp_mail}"
      },
      "http://xmlns.com/foaf/0.1/mbox_sha1sum": "%{pdp_mail_sha1}",
      "http://www.openlinksw.com/schemas/cert#owns": {
        "@id": "%{jsonld_cert_url}#cert"
      }
    },
!!.

    {
      "@id": "%{card_url}",
      "@type": [
        "http://xmlns.com/foaf/0.1/profileDocument",
        "http://www.openlinksw.com/schemas/cert#Certificate"
      ],
      "http://www.w3.org/2000/01/rdf-schema#label": "Profile Document Subject:  %{subj_name}",
      "http://schema.org/about": {
        "@id": "%{jsonld_prof_url}#identity"
      },
      "http://xmlns.com/foaf/0.1/primaryTopic": {
        "@id": "%{jsonld_prof_url}#identity"
      },
      "http://www.openlinksw.com/schemas/cert#SAN": {
        "@id": "%{jsonld_prof_url}#identity"
      },
      "http://www.openlinksw.com/schemas/cert#hasPublicKey": {
        "@id": "%{jsonld_pubkey_url}#PublicKey"
      },
      "http://www.w3.org/ns/auth/cert#key": {
        "@id": "%{jsonld_pubkey_url}#PublicKey"
      }
    },

    {
      "@id": "%{card_url}#identity",
      "http://www.w3.org/1999/xhtml/vocab#alternate": [
        {
          "@id": "%{prof_url}#identity"
        },
        {
          "@id": "%{rdfa_prof_url}#identity"
        },
        {
          "@id": "%{jsonld_prof_url}#identity"
        }
      ]
    },

    {
      "@id": "%{card_url}#identity",
      "http://www.w3.org/2002/07/owl#sameAs": [
        {
          "@id": "%{jsonld_prof_url}#identity"
        },
        {
          "@id": "%{rdfa_prof_url}#identity"
        },
        {
          "@id": "%{prof_url}#identity"
        }
      ]
    },

    {
      "@id": "%{jsonld_prof_url}#identity",
      "http://www.w3.org/1999/xhtml/vocab#alt": {
        "@id": "%{jsonld_cert_url}#cert"
      }
    }
]
