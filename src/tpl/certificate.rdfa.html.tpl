<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<title>Certificate RDFa for %{subj_name}</title>

</head>
<body>

<div xmlns="http://www.w3.org/1999/xhtml"
  prefix="
    oplcert: http://www.openlinksw.com/schemas/cert#
    rdf: http://www.w3.org/1999/02/22-rdf-syntax-ns#
    xsd: http://www.w3.org/2001/XMLSchema#
    rdfs: http://www.w3.org/2000/01/rdf-schema#"
  >
  <div typeof="rdfs:Resource" about="%{rdfa_prof_url}#identity">
    <div property="rdfs:label" content="Digital Identity Card Subject: %{subj_name}"></div>
    <div rel="oplcert:hasCertificate">
      <div typeof="oplcert:Certificate" about="%{rdfa_cert_url}#cert">
        <div property="oplcert:fingerprint" content="%{fingerprint}"></div>
        <div property="oplcert:fingerprint-digest" content="%{fingerprint-digest}"></div>
        <div rel="oplcert:signature" resource="%{signature}"></div>
        <div rel="oplcert:hasPublicKey" resource="%{rdfa_pubkey_url}#PublicKey"></div>
        <div property="oplcert:serial" content="%{serial}"></div>
        <div property="oplcert:notBefore" datatype="xsd:dateTime" content="%{date_before}"></div>
        <div property="oplcert:notAfter" datatype="xsd:dateTime" content="%{date_after}"></div>
        <div rel="oplcert:SAN" resource="%{rdfa_prof_url}#identity"></div>
        <div property="oplcert:issuer" content="%{issuer}"></div>
        <div property="oplcert:subject" content="%{subject}"></div>
      </div>
    </div>
  </div>
</div>

</body>
</html>
