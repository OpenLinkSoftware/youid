<!doctype html>
<html>
<head>
<meta charset="UTF-8">

!!{use_opal_widget}
<script src="https://code.jquery.com/jquery-3.7.0.min.js" integrity="sha256-2Pmvv0kuTBOenSvLm6bvfBSSHrUJ+3A7x6P5Ebd07/g="
    crossorigin="anonymous"></script>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet"
    integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"
    integrity="sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/markdown-it@13.0.1/dist/markdown-it.min.js" integrity="sha256-hNyljag6giCsjv/yKmxK8/VeHzvMDvc5u8AzmRvm1BI=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.11/clipboard.min.js" integrity="sha512-7O5pXpc0oCRrxk8RUfDYFgn0nO1t+jLuIOQdOMRp4APB7uZ4vSjspzp5y6YDtDs4VzUSTbWzBFZ/LKJhnyFOKw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
!!.

<link rel="describes" href="%{card_ident_url}" title="Describes" />
<link rev="describedby" href="%{card_ident_url}" title="Described By" />

<link rel="related" href="%{cert_url}" title="Related Document" type="text/turtle" />
<link rel="related" href="%{card_url}" title="Related Document"  type="text/html" />
<link rel="related" href="%{jsonld_prof_url}" title="Related Document" type="application/json+ld" />
<link rel="http://xmlns.com/foaf/0.1/primaryTopic" href="%{rdfa_prof_url}#identity" title="This Document's Primary Topic" />
%{pdp_url_head}
<!-- RelMeAuth Relations Start -->
%{rel_header_html}
<!-- RelMeAuth Relations End -->

<link rel="alternate" href="%{jsonld_prof_url}" title="Identity Card (JSON-LD Format)" type="application/json+ld" />
<link rel="alternate" href="vcard.vcf" title="Identity Card (vCard Format)" type="text/vcard" />
<link rel="alternate" href="%{pubkey_pem_url}" title="Identity Card (PKIX X.509 Certificate Format)" type="application/x-x509-ca-cert" />
!{ca_cert_url} <link rel="alternate" href="%{ca_cert_url}" title="Issuer Public Key (PKIX X.509 Certificate Format)" type="application/x-x509-ca-cert" />

<title>Profile RDFa for %{subj_name}</title>

<link href="style.css" rel="stylesheet" type="text/css">
<link href="style_opal.css" rel="stylesheet" type="text/css">

<style type="text/css">
   .rel_block {
     position: absolute;
     top: 170px;
     display: grid;
     grid-template-columns: 1fr 1fr 1fr;
     grid-column-gap: 15px;
     grid-row-gap: 5px;
   }
   .rel_item {
     width: 28px;
     height: 28px;
   }
</style>

<script type="text/javascript" src="./qrcode.js"></script>

</head>
<body>

        <div class="xcard cardWrapper">
        
            <div class="xcard cardHeader border">
            
              <h1>Your Web-Scale Verifiable Digital Identity Card</h1>
            
            </div><!-- end cardHeader -->
            
            <div class="xcard cardContent">
            
                <div class="xcard cardPic">
                
                	<img src="photo_130x145.jpg" width="130" height="145" alt="User Photo">
                
                </div><!-- end cardPic -->
!!{relList_html}
                <div class="rel_block">
%{relList_html}
                </div>
!!.
                
                <div class="cardDetails">
                
                        <p class="xcard fieldName">Common Name</p>
                        <p class="xcard fieldContent"><a href="%{webid}">%{subj_name}</a></p>
                   
                        <p class="xcard fieldName">Organization</p>
                        <p class="xcard fieldContent">%{subj_org}</p>
                    
                        <p class="xcard fieldName">Country</p>
                        <p class="xcard fieldContent">%{subj_country}</p>
                    
                        <p class="xcard fieldName">State/Province</p>
                        <p class="xcard fieldContent">%{subj_state}</p>
                   
                        <p class="xcard fieldName">Email Address</p>
                        <p class="xcard fieldContent">%{subj_email_mailto_href}</p>
!!{pdp_url}
                        <p class="xcard fieldName">Web Page</p>
                        <p class="xcard fieldContent"><a href="%{pdp_url}">%{pdp_url}</a></p>
!!.
                        <p class="xcard fieldName">Issued</p>
                        <p class="xcard fieldContent">%{date_before}</p>
                        
                        <p class="xcard fieldName">Expiry</p>
                        <p class="xcard fieldContent">%{date_after}</p>

                </div><!-- end cardDetails -->
                
               <div class="cardBottom">
                 <div class="xcard cardYouIdIcn">
                	<a class="aimg" href="http://youid.openlinksw.com"><img src="youid_logo-35px.png" width="35" height="30" alt="YouID"></a>
                	<a href="http://youid.openlinksw.com">Get Your ID Card</a>
                 </div><!-- end cardYouIdIcn -->

                 <div class="xcard vCard">
                	<a class="aimg" href="vcard.vcf"><img src="addrbook.png" width="32" height="34" alt="Add to Contacts"/></a>
                	<a href="vcard.vcf">Add to Contacts</a>
                 </div><!-- end vCard -->

                 <div class="xcard pKey">
                	<a class="aimg" href="%{pubkey_pem_url}"><img src="lock.png" width="38" height="38" alr="Certificate (.pem)"/></a>
                	<a href="%{pubkey_pem_url}">Certificate (.pem)</a>
                	<a href="%{pubkey_der_url}">Certificate (.crt)</a>
                 </div><!-- end pKey -->

!!{ca_cert_url}
                 <div class="xcard caKey">
                    <a class="aimg" href="%{ca_cert_url}"><img src="lock.png" width="38" height="38" alt="CA Certificate (.pem)"/></a>
                    <a href="%{ca_cert_url}">CA Certificate (.pem)</a>
                 </div>
!!.
!!{use_opal_widget}
                 <div class="xcard agent open-button">
                    <a class="aimg open-button" href="javascript:void(0)"><img src="chatbot-32px.png" width="32" height="32" alt="AI Agent"/></a>
                    <a class="open-button" href="javascript:void(0)">AI Agent</a>
                 </div>
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


!!{use_opal_widget}

<!-- OPAL -->
<div class="form-group mt-3">
    <a class="loggedin-btn" data-placement="bottom" target="_blank" href="" title=""><img id="uid-icon" src="svg/person-fill-check.svg"></a>
</div>


<div id="snackbar">
    <div id="msg"></div>
</div>


<div class="image-upload-template">
    <div class="user-image">
        <div class="user-img-zoom-in"><img src="svg/zoom-in.svg"/></div>
        <div class="user-img-zoom-out"><img src="svg/zoom-out.svg"/></div>
        <img src="" class="user-img-src"/>
        <div class="user-img-remove"><img src="svg/x-circle.svg"/></div>
    </div>
</div>

<textarea id="clipboard-text"></textarea>
<div class="chat-popup" id="opal-form">
  <div class="form-container">
    <h1>Talk to Me</h1>
    <div class="messages">
      <div class="questions">
        <button type="button" class="prompt">What is OpenLink YouID?</button>
        <button type="button" class="prompt">Why is OpenLink YouID Important?</button>
        <button type="button" class="prompt">How do I use OpenLink YouID?</button>
        <button type="button" class="prompt">Where can I obtain OpenLink YouID?</button>
      </div>
    </div>
    <div class="input_wrapper">
        <label id="assistant-id"></label>
        <textarea placeholder="Type message.." id="message_input" required></textarea>
        <div id="suggestions"></div>
    </div>
    <input type="file" style="display:none;" multiple id="img-upload"/>
    <button type="button" id="image-upload" class="image-btn"><img src="svg/paperclip.svg"/></span></button>
    <button type="button" class="send"><img src="svg/send.svg"/></button>
    <button type="button" class="stop d-none"><img src="svg/dash-circle.svg"/></button>
    <span type="button" class="clipboard-btn" data-clipboard-target="#clipboard-text"><img src="svg/clipboard.svg"/></span>
    <span type="button" class="share-btn"><img src="svg/paperclip.svg"/></span>
    <span type="button" class="close-btn"><img src="svg/x-circle.svg"/></span>
  </div>
</div>

<!-- these two have to be included in order Opal() to work, the rest about jQuery/Bootstrap/design is deveoper choice -->
<script src="auth.js"></script>
<script src="opalx.js"></script>
<script>
var md = window.markdownit({
                               html:true,
                               breaks:true,
                               linkify:true,
                               langPrefix:'language-',
    });

var clipboard = new ClipboardJS('.clipboard-btn');

async function showNotice (text) {
    const tm = 3000;
    $('#msg').html(text);
    $('#snackbar').show();
    setTimeout(function () {  $('#snackbar').hide(); }, tm);
}

$(function () {

    const baseUrl = "https://linkeddata.uriburner.com";
    // OIDC client variable
    var authClient = new AuthClient('%{w_opl_api_key}');
    var session = authClient.getDefaultSession();
    // OPAL interface, params: OIDC client var, backend host&port, callbacks for incoming message and error callback 
    // if callbacks not given behaviour is not defined
    var opal = new OpalX(authClient, "linkeddata.uriburner.com", receiveMessage, errorHandler, {
!{w_model}        model: '%{w_model}', // next three are to calibrate model, look at OpenAI docs.
!{w_funcs}        functions: [%{w_funcs}], // backend registered functions, can be added unless not given otherwise via module
        top_p: %{w_top_p},
        temperature: %{w_temperature},
        assistant: '%{w_assistant}' // assistant to use
    });
    var $currentMessage = undefined; // keep DOM element of the receiving message as it coming on chunks
    var currentText = undefined;
    var $messages = $('.messages'); // the messages list, shortcut

    function receiveMessage(role, chunk) { // this is a handler see above Opal() to draw incoming messages
        if (role === 'function' || role === 'tool' || role === 'function_response' || role === 'info' || role === 'message_id') {
            // in this demo we do not print functions & response from them
            return;
        }
       if (role === 'notice') {
           showNotice (chunk);
           return;
       }
       if (chunk === '[DONE]' || chunk === '[LENGTH]') { // standart markers of backend when stops sending data 
          $currentMessage = undefined;
           currentText = undefined;
           $messages.find('.cursor').remove();
           $('.stop').toggleClass('d-none', true);
           $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 0);
           // optionally we can enable the predefined prompts here
           $('.prompt').on ('click', sendPredefinedPrompt);
       } else if (!$currentMessage) { // this is first chunk of the answer
           currentText = chunk;
           $currentMessage = $('<div class="agent-message"></div>');
           $currentMessage.html(md.render(currentText));
           $messages.append($currentMessage);
           $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 0);
           $('<span class="cursor"></span>').insertAfter($currentMessage);
           $('.stop').toggleClass('d-none', false);
           $('#clipboard-text').val($('#clipboard-text').val() + '\nassistant: ' + chunk);
       } else { // next chunk
           currentText = currentText + chunk;
           currentText = currentText.replace(/【[0-9:]+†[\w+\.-]+】/g, '');
           $currentMessage.html(md.render(currentText));
           $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 0);
           $('#clipboard-text').val($('#clipboard-text').val()+chunk);
       }
    }

    function errorHandler (error) { // error handler, called by Opal() if something f goes wrong
        let $message = $('<div class="agent-message">'+error+'</div>');
        $messages.append($message);
    }

    $('.open-button').on('click', function(e) {  // to open chat popup 
        $('.open-button').hide();
        $('#opal-form').fadeIn();
    });
    $('.close-btn').on('click', function(e) { // self evident
        $('#opal-form').hide();
        $('.open-button').show();
    });

    $('#message_input').keypress(function (e) { // enter or shift + enter 
        if (!e.shiftKey && e.which === 13) {
            let text = $('#message_input').val().trim();
            e.preventDefault();
            sendPrompt(text);
        }
    });

    $('.send').on('click', function(e) { // see above, doing same thing
        let $messages = $('.chat-popup .messages');
        let text = $('#message_input').val().trim();
        sendPrompt(text);
     });

    // simple wait function to allow socket to connect etc.
    async function waitConnect() {
        while (!opal.thread_id) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

     // wrapper to draw message and call OPAL widget
     async function sendPrompt (text) {
        if (text.length && !opal.thread_id) {
            opal.connect(); // open a WebSocket and init session
            // however bind() the onOpen can't be detected synchronously, so we need to wait on timeout
            await waitConnect();
            $('.stop').on ('click', function () { opal.stop(); });
            $('.share-btn').on ('click', function () { opal.share('clipboard-link'); });
        }
        if (text.length) {
            $messages.append ($(`<div class="user-message"><p>${text}</p></div>`));
            $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 0);
            $('.prompt').off();
            await opal.send (text);
            $('.questions').hide();
            $('#message_input').val('');
            $('#clipboard-text').val($('#clipboard-text').val() + '\nuser: ' + text);
        }
     }

    // wrapper to handle predefined prompts
    async function sendPredefinedPrompt(e) {
        let text = e.target.innerHTML;
        if ($('.open-button:visible').length > 0) {
            $('.open-button').hide();
            $('#opal-form').fadeIn();
        }
        // disable the predefined promps, can enable once this one complete
        sendPrompt (text);
    }


    $('.image-btn').on('click', function(){ $('#img-upload').trigger('click'); });

    $('#img-upload').on('change', function(e) {
        var $messages = $(".messages");
        for (const file of e.currentTarget.files) {
            let imgURL = URL.createObjectURL(file);
            let $div = $($('.image-upload-template').clone().html());
            let $img = $div.find('.user-img-src');

            $img.on('load', async function () {
                const r = await fetch($(this).attr('src'));
                const blob = await r.blob();
                const file_id = await opal.addFile(file.name, file.type, blob, file.type.startsWith('image/') ? 'vision' : 'assistants');
                $(this).attr('id', file_id);
            });

            $img.attr("src", imgURL);

            $div.find('.user-img-remove').on('click', function (e) {
                const file_id = $($div).find('.user-img-src').attr('id');
                opal.deleteFile(file_id).then(() => { $($div).remove(); });
            });

            if (file?.type.startsWith('image/')) {
                $div.find('.user-img-zoom-in').on('click', function (e) {
                    let $img = $(this).siblings('.user-img-src');
                    let height = $img.height();
                    height += 50;
                    if (height >= 480) return;
                    $img.height(height);
                });

                $div.find('.user-img-zoom-out').on('click', function (e) {
                    let $img = $(this).siblings('.user-img-src');
                    let height = $img.height();
                    height -= 50;
                    if (height <= 120) return;
                    $img.height(height);
                });
            }

            $div.show();
            $messages.append($div);
        }
        $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
        $('#img-upload').val('');
    });

    /* Assistant suggestions */
    var assistants = [];
    opal.loadAssistants().then(() => { assistants = opal.getAssistants() });
    var $suggestions = $('#suggestions').hide();

    $suggestions.on('click', '.autocomplete-suggestion', function() {
        let $mentionInput = $('#message_input');
        let selectedAssistant = $(this).text();
        let text = $mentionInput.val();
        let caretPos = $mentionInput[0].selectionStart;
        let beforeCaret = text.substring(0, caretPos).replace(/@\w*$/, '@' + selectedAssistant + ' ');
        let afterCaret = text.substring(caretPos);
        opal.setAssistant($(this).attr('data-assist-id'));
        $mentionInput.val(afterCaret);
        $('#assistant-id').text(beforeCaret).show();
        $mentionInput.css('text-indent', Math.round($('#assistant-id').width()) + 15);
        $mentionInput.focus();
        $suggestions.hide();
    });

    $(document).click(function(e) {
        if (!$(e.target).closest('#suggestions').length) {
            $suggestions.hide();
        }
    });

    function selectSuggestion(direction) {
        let $options = $suggestions.find('.autocomplete-suggestion');
        let $selected = $options.filter('.selected');
        let index = $options.index($selected);


        if (40 == direction) {
            index = (index + 1) % $options.length;
        } else if (38 == direction) {
            index = (index - 1 + $options.length) % $options.length;
        }
        $options.removeClass('selected');
        $options.eq(index).addClass('selected');

        let selectedOption = $options.eq(index)[0];
        let popupHeight = $suggestions.height();
        let popupScrollTop = $suggestions.scrollTop();
        let optionTop = selectedOption.offsetTop;
        let optionHeight = selectedOption.offsetHeight;

        if (optionTop < popupScrollTop) {
            $suggestions.scrollTop(optionTop);
        } else if (optionTop + optionHeight > popupScrollTop + popupHeight) {
            $suggestions.scrollTop(optionTop + optionHeight - popupHeight);
        }
    }

    $('#message_input').on('keydown', function(e) {
        if ($suggestions.is(':visible')) {
            if (38 == e.keyCode || 40 == e.keyCode) {
                selectSuggestion(e.keyCode);
                e.preventDefault();
            } else if (13 == e.keyCode) {
                $('#suggestions .autocomplete-suggestion.selected').trigger('click');
                e.preventDefault();
            } else if (27 == e.keyCode) {
                $suggestions.hide();
            }
        }
    });

    $('#message_input').on('keyup', function(e) {
        if ($suggestions.is(':visible') && (38 == e.keyCode || 40 == e.keyCode || 13 == e.keyCode || 27 == e.keyCode)) {
            e.preventDefault();
            return;
        }
        let caretPos = this.selectionStart;
        let $mentionInput = $('#message_input');
        let text = this.value.trim();
        if (text.split(/\s+/).length === 1 && text.match(/^@\w*$/)) {
            let query = text.substring(1).toLowerCase();
            let matches = assistants.filter(function(item) {
                return item.name.toLowerCase().startsWith(query);
            });
            e.preventDefault();
            if (matches.length > 0) {
                var suggestionsHtml = matches.map(function(item) {
                    return `<div class="autocomplete-suggestion" data-assist-id="${item.id}">${item.name}</div>`;
                }).join('');
                $suggestions.html(suggestionsHtml).show();
                /*
                $suggestions.css({
                                 bottom: $mentionInput.position().top + $mentionInput.outerHeight() + 15,
                                 left: $mentionInput.position().left + 10
                });
                */
            } else {
                $suggestions.hide();
            }
        } else {
            $suggestions.hide();
        }
        if (0 === text.length && 8 === e.keyCode) {
            $('#assistant-id').text('').hide();
            $mentionInput.css('text-indent', 0);
        }
    });
    /* end suggestions */

    /* replace images with location from OPAL installation */
    var imgBase = baseUrl + '/chat/';
    $('img').each(function() {
        let src = $(this).attr('src');
        if (0 === src.indexOf('svg/'))
          $(this).attr('src', new URL(src, imgBase).href);
    });
    $('.prompt').on ('click', sendPredefinedPrompt);
});
</script>

!!.

</body>
</html>