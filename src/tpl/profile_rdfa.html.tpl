<!doctype html>
<html>
<head>
<meta charset="UTF-8">

<link rel="related" href="%{cert_url}" title="Related Document" type="text/turtle" />
<link rel="related" href="%{card_url}" title="Related Document"  type="text/html" />
<link rel="related" href="%{jsonld_prof_url}" title="Related Document" type="application/json+ld" />
<link rel="http://xmlns.com/foaf/0.1/primaryTopic" href="%{rdfa_prof_url}#identity" title="This Document's Primary Topic" />
%{pdp_url_head}
%{rel_header_html}

<link rel="alternate" href="%{jsonld_prof_url}" title="Identity Card (JSON-LD Format)" type="application/json+ld" />
<link rel="alternate" href="vcard.vcf" title="Identity Card (vCard Format)" type="text/vcard" />
<link rel="alternate" href="%{pubkey_pem_url}" title="Identity Card (PKIX X.509 Certificate Format)" type="application/x-x509-ca-cert" />

<title>Profile RDFa for %{subj_name}</title>

<link href="style.css" rel="stylesheet" type="text/css">

<style type="text/css">
   .rel_block {
     position: absolute;
     top: 170px;
     display: grid;
     grid-template-columns: 1fr 1fr 1fr;
/*     grid-gap: 15px;*/
   }
   .rel_item {
     width: 28px;
     height: 28px;
     padding-right: 15px;
     padding-bottom: 2px;
   }
</style>

<script type="text/javascript" src="./qrcode.js"></script>

</head>
<body>

        <div class="cardWrapper">
        
            <div class="cardHeader border">
            
              <h1>Your Web-Scale Verifiable Digital Identity Card</h1>
            
            </div><!-- end cardHeader -->
            
            <div class="cardContent">
            
                <div class="cardPic">
                
                	<img src="photo_130x145.jpg" width="130" height="145" alt="User Photo">
                
                </div><!-- end cardPic -->
!!{relList_html}
                <div class="rel_block">
%{relList_html}
                </div>
!!.
                
                <div class="cardDetails">
                
                        <p class="fieldName">Common Name</p>
                        <p class="fieldContent"><a href="%{webid}">%{subj_name}</a></p>
                   
                        <p class="fieldName">Organization</p>
                        <p class="fieldContent">%{subj_org}</p>
                    
                        <p class="fieldName">Country</p>
                        <p class="fieldContent">%{subj_country}</p>
                    
                        <p class="fieldName">State/Province</p>
                        <p class="fieldContent">%{subj_state}</p>
                   
                        <p class="fieldName">Email Address</p>
                        <p class="fieldContent">%{subj_email_mailto_href}</p>
                    
!!{pdp_url}
                        <p class="fieldName">Web Page</p>
                        <p class="fieldContent"><a href="%{pdp_url}">%{pdp_url}</a></p>
!!.
                        <p class="fieldName">Issued</p>
                        <p class="fieldContent">%{date_before}</p>
                        
                        <p class="fieldName">Expiry</p>
                        <p class="fieldContent">%{date_after}</p>
                
                </div><!-- end cardDetails -->
                
                <div class="cardYouIdIcn">
                
                	<a class="aimg" href="http://youid.openlinksw.com"><img src="youid_logo-35px.png" width="35" height="30" alt="YouID"></a>
                	<a href="http://youid.openlinksw.com">Get Your ID Card</a>
                
                </div><!-- end cardYouIdIcn -->

                <div class="vCard">
                
                	<a class="aimg" href="vcard.vcf"><img src="addrbook.png" width="32" height="34" alt="Add to Contacts"/></a>
                	<a href="vcard.vcf">Add to Contacts</a>
                
                </div><!-- end vCard -->

                <div class="pKey">
                
                	<a class="aimg" href="%{pubkey_pem_url}"><img src="lock.png" width="38" height="38" alr="Public Key"/></a>
                	<a href="%{pubkey_pem_url}">Public Key</a>
                
                </div><!-- end pKey -->

!!{ca_cert_url}
                <div class="caKey">
                	<a class="aimg" href="%{ca_cert_url}"><img src="lock.png" width="38" height="38" alt="Issuer Public Key"/></a>
                        <a href="%{ca_cert_url}">Issuer Public Key</a>
                </div>
!!.
                <div class="cardQr">
                	%{qr_rdfa_img}
                </div>
                <!-- end cardQr -->
                
                <div class="clear"></div>
            
            </div><!-- end cardContent -->
        
        </div><!-- end cardWrapper -->

<!-- rdfa -->
%{rdfa}
<!-- end rdfa -->

<!-- profile turtles -->
<!-- end profile turtles -->

<!-- profile json_ld -->
<script type="application/ld+json">
%{json_ld}
</script> 
<!-- end profile json_ld -->


<script>
(function () {

  function create_qrcode(text) 
  {
    var errorCorrectionLevel = 'Q';
    var typeNumber = 8;
    qrcode.stringToBytes = qrcode.stringToBytesFuncs['default'];

    var qr = qrcode(typeNumber || 4, errorCorrectionLevel || 'M');
    qr.addData(text, 'Byte');
    qr.make();

    return qr.createImgTag(null, 2, 'QR code');
  }


  document.addEventListener('DOMContentLoaded', 
    function()
    {
       var el = document.querySelector('.cardQr');
       if (el)
         el.innerHTML = create_qrcode(location.href);
    });

})();
</script>


</body>
</html>