function showError(message) {

    $('#message').html("<div class='alert alert-danger'>");
    $('#message > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
        .append("</button>");
    $('#message > .alert-danger')
        .append("<strong>" + message + "</strong>");
    $('#message > .alert-danger')
        .append('</div>');
}

function clearError(){
    $('#message').empty();
}

$.fn.spin.presets.c2p = {
    lines: 13 // The number of lines to draw
    , length: 28 // The length of each line
    , width: 14 // The line thickness
    , radius: 42 // The radius of the inner circle
    , scale: 0.75 // Scales overall size of the spinner
    , corners: 1 // Corner roundness (0..1)
    , color: '#000' // #rgb or #rrggbb or array of colors
    , opacity: 0.25 // Opacity of the lines
    , rotate: 0 // The rotation offset
    , direction: 1 // 1: clockwise, -1: counterclockwise
    , speed: 1 // Rounds per second
    , trail: 60 // Afterglow percentage
    , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
    , zIndex: 2e9 // The z-index (defaults to 2000000000)
    , className: 'spinner' // The CSS class to assign to the spinner
    , top: '30%' // Top position relative to parent
    , left: '50%' // Left position relative to parent
    , shadow: false // Whether to render a shadow
    , hwaccel: false // Whether to use hardware acceleration
    , position: 'absolute' // Element positioning
};

var winnerSource = $("#winner-template").html();
var winnerTemplate = Handlebars.compile(winnerSource);

function showRedemptionMessage(data) {
    $("#slider").fadeOut(400);
    $("#redeem_form").fadeOut(400, function () {
        var redemptionContainer = $("#redemption_container");
        if (data.success == false) {
            $("#redemption_message").html(data.message);
        } else {
            redemptionContainer.html(winnerTemplate(data));
        }
        redemptionContainer.fadeIn();
    });
}

function registerShareBtn(){
    $("#fb_share_btn").on("click", function(e){
        FB.ui({
            method: 'share',
            href: 'https://thegiftticket.com/'
        }, function(response){});
    });
}

$(function () {

    var BASE_URL = "https://api-staging.thegiftticket.com/api";

    if (window.location.href.indexOf('localhost') > 0) {
        BASE_URL = "http://localhost:8080/api";
    }

    if (window.location.href.indexOf('alleyway.duckdns.org') > 0) {
        BASE_URL = "http://alleyway.duckdns.org:8080/api";
    }

  //  if (window.location.href.indexOf('thegiftticket.com') > 0) {
        BASE_URL = "https://api.thegiftticket.com/api";
    //}


    var redemptionCode = $('#redemption_code');
    redemptionCode.inputmask({
        mask:"*****-aaaa",
        showMaskOnHover: false
    });
    redemptionCode.attr('autocomplete', 'off');
    redemptionCode.attr('autocorrect', 'off');
    redemptionCode.attr('autocapitalize', 'off');


    var currentLocation = $.url(); //current page URL

    var purchaser = currentLocation.fparam("purchaser");
    var amount = currentLocation.fparam("amount");
    var recipientEmail = currentLocation.fparam("recipient_email");

    if (purchaser != null) {
        var winnerData = {
            'purchaser': purchaser,
            'amount': amount,
            'recipient_email': recipientEmail
        };
        showRedemptionMessage(winnerData);
    }

    var autoCode = currentLocation.fparam("redemption_code");

    if (autoCode != null) showError("Redemption code and serial have been filled in automatically for testing purposes!");

    redemptionCode.val(autoCode);

    $('#create_code_button').bind('click', function (event) {
        clearError();
        $("#redeem_area").spin('c2p');

        $('#redemption_code').prop("disabled", true);

        $.get( BASE_URL + "/redemption")
            .success(function (data) {
                var codeField = $('#redemption_code');
                //var serailField = $('#short_serial');
                //var array = data.split("+");

                //serailField.val(array[0]);
                codeField.val(array[1]);

                codeField.prop("disabled", false);

            })
            .error(function (error) {
                codeField.enable();
                $("#redeem_area").spin(false);

                showError(error.responseJSON.description);

                //console.log(error.responseJSON.description);
            })
            .complete(function () {
                $("#redeem_area").spin(false);
            });
    });



    $('#redeem_form').bind('submit', function (event) {
        event.preventDefault();
        $("#redeem_area").spin('c2p');

        var data = {};

        data["redemptionCode"] = $("#redemption_code").val();
        //data["shortSerial"] = $("#short_serial").val();
        data["receiverEmail"] = $("#receiver_email").val();

        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: BASE_URL + "/scratcher/redeem",
            data: JSON.stringify(data),
            dataType: 'json',
            timeout: 10000,
            success: function (data) {

                if (data.success == false) {
                    showError(data.message);
                } else {
                    $("#slider").fadeOut(400);
                    $("#redeem_form").fadeOut(400, function () {
                        var redemptionContainer = $("#redemption_container");
                        redemptionContainer.html(winnerTemplate(data));
                        redemptionContainer.fadeIn();
                        registerShareBtn();
                    });
                }

            },
            error: function (error) {
                showError(error.responseJSON.message);
                console.log(error.responseJSON.message);
            },
            complete: function (e) {
                $("#redeem_area").spin(false);
            }
        });
    });


});