/*
 *  This file is part of the OpenLink YouID
 *
 *  Copyright (C) 2015-2020 OpenLink Software
 *
 *  This project is free software; you can redistribute it and/or modify it
 *  under the terms of the GNU General Public License as published by the
 *  Free Software Foundation; only version 2 of the License, dated June 1991.
 *
 *  This program is distributed in the hope that it will be useful, but
 *  WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 *  General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License along
 *  with this program; if not, write to the Free Software Foundation, Inc.,
 *  51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA
 *
 */

  function genManualUploads(webid, certData)
  {
    var cert = certData.cert;
    var url = new URL(webid);
    url.hash = "#PublicKey";
    var keyUri = url.toString();
    var CN = cert.subject.getField('CN');
    var commonName = CN.value;
    var exponent = cert.publicKey.e.toString(10);
    var modulus = cert.publicKey.n.toString(16).toUpperCase();
    var timeCreated = cert.validity.notBefore.toISOString();

    var ttl = `
  @prefix : <#>.
  @prefix cert: <http://www.w3.org/ns/auth/cert#>.
  @prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
  @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
  @prefix dcterms: <http://purl.org/dc/terms/>.
  @prefix foaf: <http://xmlns.com/foaf/0.1/>.
  @prefix schema: <http://schema.org/>.
  @prefix owl:  <http://www.w3.org/2002/07/owl#> .

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
    dcterms:created "${timeCreated}"^^xsd:dateTime;
    dcterms:title "Created by YouID";
    rdfs:label "${commonName}";
    cert:exponent "${exponent}"^^xsd:int;
    cert:modulus "${modulus}"^^xsd:hexBinary;
    owl:sameAs <${certData.fingerprint_ni}>, <${certData.fingerprint_di}> . 
  `;
  
    var jsonld = `
  {
    "@context": {
      "owl": "http://www.w3.org/2002/07/owl#", 
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
        },
        "owl:sameAs": [
          {
           "@id": "${certData.fingerprint_ni}"
          },
          {
           "@id": "${certData.fingerprint_di}"
          }
        ]
      }
    ]
  }
  `;

    var rdfxml = `
  <rdf:RDF
   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
   xmlns:owl: http://www.w3.org/2002/07/owl#
   xmlns:foaf="http://xmlns.com/foaf/0.1/"
   xmlns:cert="http://www.w3.org/ns/auth/cert#"
   xmlns:dcterms="http://purl.org/dc/terms/"
   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">
   xmlns:schema="http://schema.org/">
      <rdf:Description rdf:about="">
          <rdf:type rdf:resource="http://xmlns.com/foaf/0.1/PersonalProfileDocument"/>
          <foaf:maker rdf:resource="${webid}"/>
          <foaf:primaryTopic rdf:resource="${webid}"/>
      </rdf:Description>
      <rdf:Description rdf:about="${webid}">
          <rdf:type rdf:resource="http://xmlns.com/foaf/0.1/Person"/>
          <rdf:type rdf:resource="http://schema.org/Person"/>
          <cert:key rdf:resource="${keyUri}"/>
          <foaf:name>${commonName}</foaf:name>
      </rdf:Description>
      <rdf:Description rdf:about="${keyUri}">
          <dcterms:created rdf:datatype="http://www.w3.org/2001/XMLSchema#dateTime">${timeCreated}</dcterms:created>
          <dcterms:title>Created by YouID</dcterms:title>
          <rdf:type rdf:resource="http://www.w3.org/ns/auth/cert#RSAPublicKey"/>
          <rdfs:label>"${commonName}"</rdfs:label>
          <owl:sameAs rdf:resource="${certData.fingerprint_ni}"/>
          <owl:sameAs rdf:resource="${certData.fingerprint_di}"/>
          <cert:exponent rdf:datatype="http://www.w3.org/2001/XMLSchema#int">${exponent}</cert:exponent>
          <cert:modulus rdf:datatype="http://www.w3.org/2001/XMLSchema#hexBinary">${modulus}</cert:modulus>
      </rdf:Description>
  </rdf:RDF>
  `;
   
   return {ttl, jsonld, rdfxml};
  }