<div xmlns="http://www.w3.org/1999/xhtml"
  prefix="
    foaf: http://xmlns.com/foaf/0.1/
    owl: http://www.w3.org/2002/07/owl#
    rdfs: http://www.w3.org/2000/01/rdf-schema#
    cert: http://www.w3.org/ns/auth/cert#
    oplcert: http://www.openlinksw.com/schemas/cert#
    rdf: http://www.w3.org/1999/02/22-rdf-syntax-ns#
    xhv: http://www.w3.org/1999/xhtml/vocab#
    xsd: http://www.w3.org/2001/XMLSchema#"
  >

  <div typeof="foaf:Agent" about="%{rdfa_prof_url}#identity">

    <div rel="cert:key">
      <div typeof="cert:RSAPublicKey" about="%{pubkey_url}#PublicKey">
        <div property="cert:modulus" datatype="xsd:hexBinary" content="%{modulus}"></div>
        <div property="cert:exponent" datatype="xsd:int" content="%{exponent}"></div>
      </div>
    </div>
    
    <div rel="owl:sameAs" resource="%{jsonld_prof_url}#identity"></div>
    <div rel="owl:sameAs" resource="%{card_url}#identity"></div>
    <div rel="owl:sameAs" resource="%{prof_url}#identity"></div>

    <div rel="xhv:alternate" resource="%{jsonld_prof_url}#identity"></div>
    <div rel="xhv:alternate" resource="%{prof_url}#identity"></div>
    <div rel="xhv:alternate" resource="%{card_url}#identity"></div>


    <div rel="oplcert:hasCertificate" resource="%{cert_url}#cert"></div>
    <div typeof="oplcert:Certificate" about="%{cert_url}#cert">
      <div property="oplcert:fingerprint-digest" content="%{fingerprint-digest}"></div>
      <div property="oplcert:fingerprint" content="%{fingerprint}"></div>
      <div property="oplcert:serial" content="%{serial}"></div>
      <div property="oplcert:notBefore" datatype="xsd:dateTime" content="%{date_before}"></div>
      <div property="oplcert:notAfter" datatype="xsd:dateTime" content="%{date_after}"></div>
      <div property="oplcert:issuer" content="%{issuer}"></div>
      <div rel="oplcert:signature" resource="%{signature}"></div>
      <div property="oplcert:subject" content="%{subject}"></div>
      <div rel="oplcert:hasPublicKey" resource="%{pubkey_url}#PublicKey"></div>
      <div rel="oplcert:SAN" resource="%{rdfa_prof_url}#identity"></div>%{ian}
    </div>
%{pdp_add}
    <div rel="oplcert:owns" resource="%{cert_url}#cert"></div>
  </div>	

  <div typeof="foaf:profileDocument" about="%{rdfa_prof_url}">
    <div rel="rdf:type" resource="oplcert:Certificate"></div>
    <div property="rdfs:label" content="Profile Document Subject: %{subj_name}"></div>
    <div rel="foaf:primaryTopic" resource="%{rdfa_prof_url}#identity"></div>
    <div rel="oplcert:SAN" resource="%{rdfa_prof_url}#identity"></div>
    <div rel="oplcert:hasPublicKey" resource="%{pubkey_url}#PublicKey"></div>
    <div rel="cert:key" resource="%{pubkey_url}#PublicKey"></div>
  </div>
</div>

