@prefix rsa: <http://www.w3.org/ns/auth/rsa#> .
@prefix cert: <http://www.w3.org/ns/auth/cert#> .
@prefix oplcert: <http://www.openlinksw.com/schemas/cert#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix xhv: <http://www.w3.org/1999/xhtml/vocab#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix owl:  <http://www.w3.org/2002/07/owl#> .

<%{prof_url}#identity>    cert:key <%{pubkey_url}#PublicKey> . 
<%{pubkey_url}#PublicKey>    a cert:RSAPublicKey ; 
         cert:modulus "%{modulus}"^^xsd:hexBinary ; 
         cert:exponent "%{exponent}"^^xsd:int . 

<%{prof_url}#identity> oplcert:hasCertificate <%{cert_url}#cert> . 
<%{cert_url}#cert>     a oplcert:Certificate ; 
         oplcert:fingerprint "%{fingerprint}" ; 
         oplcert:fingerprint-digest "%{fingerprint-digest}" ; 
         oplcert:subject "%{subject}" ; 
         oplcert:issuer "%{issuer}" ; 
         oplcert:notBefore "%{date_before}"^^xsd:dateTime ; 
         oplcert:notAfter "%{date_after}"^^xsd:dateTime ; 
         oplcert:serial "%{serial}" ; 
         oplcert:SAN <%{prof_url}#identity> ; %{ian}
         oplcert:hasPublicKey <%{pubkey_url}#PublicKey> ;  
         oplcert:signature <%{signature}> . 

<%{prof_url}#identity> a foaf:Agent ; 
    oplcert:owns <%{cert_url}#cert> %{pdp_add} .

<> 
a foaf:profileDocument , oplcert:Certificate ;
rdfs:label           "Profile Document Subject: %{subj_name}" ;
 foaf:primaryTopic     <%{prof_url}#identity> ;
 oplcert:SAN           <%{prof_url}#identity> ;
 oplcert:hasPublicKey  <%{pubkey_url}#PublicKey> ;
 cert:key  <%{pubkey_url}#PublicKey> .

<> xhv:alternate <%{card_url}#identity>;
   xhv:alternate <%{jsonld_prof_url}#identity> ;
   xhv:alternate <%{rdfa_prof_url}#identity> ;
   xhv:alternate <%{prof_url}#identity> .

<%{card_url}#identity> owl:sameAs <%{jsonld_prof_url}#identity> ,
	<%{rdfa_prof_url}#identity> ,
	<%{prof_url}#identity> .
