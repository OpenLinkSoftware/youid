  function genManualUploads(webid, certData)
  {
    var cert = certData.cert;
    var url = new URL(webid);
    url.hash = "#PublicKey";
    var keyUri = url.toString();
    var CN = cert.subject.getField('CN');
    var commonName = CN.value;
    var exponent = cert.publicKey.e.toString(10);
    var modulus = cert.publicKey.n.toString(16).toLowerCase();
    var timeCreated = cert.validity.notBefore.toISOString();

    var ttl = `
  @prefix : <#>.
  @prefix cert: <http://www.w3.org/ns/auth/cert#>.
  @prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
  @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
  @prefix terms: <http://purl.org/dc/terms/>.
  @prefix foaf: <http://xmlns.com/foaf/0.1/>.
  @prefix schema: <http://schema.org/>.

  <>
    a foaf:PersonalProfileDocument ;
    foaf:maker <${webid}> ;
    foaf:primaryTopic <${webid}> .

  <${webid}>
    a foaf:Person ;
    a schema:Person ;
    foaf:name "${commonName}" ;
    cert:key <${keyUri}>.


  <${keyUri}>
    a cert:RSAPublicKey;
    terms:created "${timeCreated}"^^xsd:dateTime;
    terms:title "Created by YouID";
    rdfs:label "${commonName}";
    cert:exponent "${exponent}"^^xsd:int;
    cert:modulus "${modulus}"^^xsd:hexBinary.
  `;
  
    var jsonld = `
  {
    "@context": {
      "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      "foaf": "http://xmlns.com/foaf/0.1/",
      "schema": "http://schema.org/",
      "cert": "http://www.w3.org/ns/auth/cert#",
      "dcterms": "http://purl.org/dc/terms/",
      "xsd": "http://www.w3.org/2001/XMLSchema#",
      "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
      "schema": "http://schema.org/"
    },
    "@graph": [
      {
        "@id": "",
        "@type": "foaf:PersonalProfileDocument",
        "foaf:maker": {
          "@id": "${webid}"
        },
        "foaf:primaryTopic": {
          "@id": "${webid}"
        }
      },
      {
        "@id": "${webid}",
        "@type": [
          "foaf:Person",
          "schema:Person"
        ],
        "cert:key": {
          "@id": "${keyUri}"
        },
        "foaf:name": "${commonName}"
      },
      {
        "@id": "${keyUri}",
        "@type": "cert:RSAPublicKey",
        "dcterms:created": {
          "@type": "xsd:dateTime",
          "@value": "${timeCreated}"
        },
        "dcterms:title": "Created by YouID",
        "rdfs:label": "${commonName}",
        "cert:exponent": {
          "@type": "xsd:int",
          "@value": "${exponent}"
        },
        "cert:modulus": {
          "@type": "xsd:hexBinary",
          "@value": "${modulus}"
        }
      }
    ]
  }
  `;

    var rdfxml = `
  <rdf:RDF
   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
   xmlns:n0="http://xmlns.com/foaf/0.1/"
   xmlns:cert="http://www.w3.org/ns/auth/cert#"
   xmlns:terms="http://purl.org/dc/terms/"
   xmlns:rd="http://www.w3.org/2000/01/rdf-schema#">
   xmlns:schema="http://schema.org/">
      <rdf:Description rdf:about="">
          <rdf:type rdf:resource="http://xmlns.com/foaf/0.1/PersonalProfileDocument"/>
          <n0:maker rdf:resource="${webid}"/>
          <n0:primaryTopic rdf:resource="${webid}"/>
      </rdf:Description>
      <rdf:Description rdf:about="${webid}">
          <rdf:type rdf:resource="http://xmlns.com/foaf/0.1/Person"/>
          <rdf:type rdf:resource="http://schema.org/Person"/>
          <cert:key rdf:resource="${keyUri}"/>
          <n0:name>${commonName}</n0:name>
      </rdf:Description>
      <rdf:Description rdf:about="${keyUri}">
          <terms:created rdf:datatype="http://www.w3.org/2001/XMLSchema#dateTime">${timeCreated}</terms:created>
          <terms:title>Created by YouID</terms:title>
          <rdf:type rdf:resource="http://www.w3.org/ns/auth/cert#RSAPublicKey"/>
          <rd:label>"${commonName}"</rd:label>
          <cert:exponent rdf:datatype="http://www.w3.org/2001/XMLSchema#int">${exponent}</cert:exponent>
          <cert:modulus rdf:datatype="http://www.w3.org/2001/XMLSchema#hexBinary">${modulus}</cert:modulus>
      </rdf:Description>
  </rdf:RDF>
  `;
   
   return {ttl, jsonld, rdfxml};
  }