<!doctype html>
<html>
<head>
<meta charset="UTF-8">

<link rel="related" href="%{cert_url}" title="Related Document" type="text/turtle" />
<link rel="related" href="%{card_url}" title="Related Document"  type="text/html" />
<link rel="related" href="%{jsonld_prof_url}" title="Related Document" type="application/json+ld" />
<link rel="http://xmlns.com/foaf/0.1/primaryTopic" href="%{rdfa_prof_url}#identity" title="This Document's Primary Topic" />
%{pdp_url_head}

<title>Profile RDFa for %{subj_name}</title>

<link href="style.css" rel="stylesheet" type="text/css">


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
                    
%{pdp_url_row}
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

%{ca_key_row}
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


</body>
</html>