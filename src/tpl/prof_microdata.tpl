<div>
  <div itemtype="http://xmlns.com/foaf/0.1/Agent" itemid="%{card_url}#identity" itemscope>
    <div itemprop="http://www.w3.org/ns/auth/cert#key" itemtype="http://www.w3.org/ns/auth/cert#RSAPublicKey" itemid="%{pubkey_url}#PublicKey" itemscope>
      <meta itemprop="modulus" content="%{modulus}" />
      <meta itemprop="exponent" content="%{exponent}" />
    </div>

    <link itemprop="http://www.w3.org/2002/07/owl#sameAs" href="%{rdfa_prof_url}#identity" />
    <link itemprop="http://www.w3.org/2002/07/owl#sameAs" href="%{jsonld_prof_url}#identity" />
    <link itemprop="http://www.w3.org/2002/07/owl#sameAs" href="%{prof_url}#identity" />

    <link itemprop="http://www.w3.org/1999/xhtml/vocab#alternate" href="%{prof_url}#identity" />
    <link itemprop="http://www.w3.org/1999/xhtml/vocab#alternate" href="%{jsonld_prof_url}#identity" />
    <link itemprop="http://www.w3.org/1999/xhtml/vocab#alternate" href="%{rdfa_prof_url}#identity" />

    <link itemprop="http://www.openlinksw.com/schemas/cert#hasCertificate" href="%{cert_url}#cert" />
    <div itemtype="http://www.openlinksw.com/schemas/cert#Certificate" itemid="%{cert_url}#cert" itemscope>
      <meta itemprop="fingerprint" content="%{fingerprint}" />
      <meta itemprop="fingerprint-digest" content="%{fingerprint-digest}" />
      <meta itemprop="serial" content="%{serial}" />
      <meta itemprop="notBefore" content="%{date_before}" />
      <meta itemprop="notAfter" content="%{date_after}" />
      <meta itemprop="issuer" content="%{issuer}" />
      <link itemprop="signature" href="%{signature}" />
      <meta itemprop="subject" content="%{subject}" />
      <link itemprop="hasPublicKey" href="%{pubkey_url}#PublicKey" />
      <link itemprop="SAN" href="%{card_url}#identity" />%{ian}
    </div>
%{pdp_add}
    <link itemprop="http://www.openlinksw.com/schemas/cert#owns"  href="%{cert_url}#cert" />
  </div>

  <div itemtype="http://xmlns.com/foaf/0.1/profileDocument" itemid="%{card_url}" itemscope>
    <link itemprop="http://schema.org/additionalType" href="http://www.openlinksw.com/schemas/cert#Certificate" />
    <meta itemprop="http://www.w3.org/2000/01/rdf-schema#label" content="Profile Document Subject: %{subj_name}" />
    <div itemprop="http://xmlns.com/foaf/0.1/primaryTopic" itemtype="http://xmlns.com/foaf/0.1/Agent" itemid="%{card_url}#identity" itemscope></div>
    <link itemprop="http://www.openlinksw.com/schemas/cert#SAN" href="%{card_url}#identity" />
    <link itemprop="http://www.openlinksw.com/schemas/cert#hasPublicKey" href="%{pubkey_url}#PublicKey" />
    <link itemprop="http://www.w3.org/ns/auth/cert#key" href="%{pubkey_url}#PublicKey" />
  </div>
</div>

