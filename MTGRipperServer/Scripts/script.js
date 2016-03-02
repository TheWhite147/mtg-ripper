// JavaScript source code

var _actualCurrency = "USD";
var _usdValue = -1;
var _actualMode = "mtgprice";

$(document).ready(function () {

    // Set focus on search box
    $("#inputSearch").trigger("focus");    

    // Hide page content
    $("#mainContent").hide();

    // Submit the search form
    $("#searchForm").submit(function (event) {
        if (isFormValid()) {
            var spinner = new Spinner(opts).spin();
            $("#spinnerZone").html(spinner.el);
            $("#mainContent").hide();
            $("#inputSearch").trigger("blur");

            var searchTermsInput = encodeURIComponent($("#inputSearch").val());

            if (_actualMode === "mtgprice") {
                var urlSearch = "http://" + window.location.host + "/ExternalAPI/SearchResults?searchTerms=" + searchTermsInput;

                var request = $.get(urlSearch, function (data) {
                    $("#spinnerZone").html("");
                    $("#mainContent").show();

                    $("#mainContent").html(data);
                    updateControls();

                    setCurrency();
                })
                .done(function () {
                    //alert("second success");
                })
                .fail(function () {
                    $("#spinnerZone").html("");
                    $("#mainContent").show();
                    $("#mainContent").html("<strong>ERROR</strong>");
                })
                .always(function () {
                });
            }
            else {
                var urlSearch = "http://" + window.location.host + "/ExternalAPI/TemplateCardInfo?searchTerms=" + searchTermsInput;

                var request = $.get(urlSearch, function (data) {
                    $("#spinnerZone").html("");
                    $("#mainContent").show();
                    $("#mainContent").html(data);

                    RipPriceTKL(searchTermsInput);
                    RipPriceGK(searchTermsInput);
                    RipPriceF2F(searchTermsInput);

                })
                .done(function () {
                    //alert("second success");
                })
                .fail(function () {
                    $("#spinnerZone").html("");
                    $("#mainContent").show();
                    $("#mainContent").html("<strong>ERROR</strong>");
                })
                .always(function () {
                });
            }

            event.preventDefault();
        }
    });

    $("#inputSearch").focus(function () {
        $("#inputSearch").val("");
    });

    $(".btnCurrency").click(function () {
        if (!$(this).hasClass("disabled")) {
            toggleCurrency();
        }
    });

    $(".btnMode").click(function () {
        if (!$(this).hasClass("disabled")) {
            toggleMode();
        }
    });

    // Form validation
    function isFormValid() {
        if ($("#inputSearch").val() == "")
            return false;

        return true;
    }

    updateControls();
    updateCurrency();
    updateMode();

});

function updateControls() {

    // Show card image button
    $(".showCardBtn").click(function () {
        var idResult = $(this).data("result-id");
        var image = $(".resultImg" + idResult);

        if ($(this).hasClass("imageLoaded")) {
            if ($(this).hasClass("show")) {
                $(this).removeClass("show");
                $(this).html("Show card");
                $(image).hide();
            } else {
                $(this).addClass("show");
                $(this).html("Hide card");
                $(image).show();
            }
        } else {
            var imageSrc = $(this).data("image-src");
            if (!imageSrc)
                return;

            $(this).addClass("imageLoaded");
            $(this).addClass("show");
            $(this).html("Hide card");
            
            $(image).attr("src", imageSrc);
            $(image).show();
        }
    });
}


// Currency stuff
function updateCurrency() {
    if (_usdValue === -1) {
        // We must update currency
        $(".btnCurrency").addClass("disabled");
        $("#currencyStatus").html("Updating currency...");

        var urlSearch = "http://" + window.location.host + "/ExternalAPI/GetCurrency";

        var request = $.get(urlSearch, function (data) {
            var dataObj = JSON.parse(data);
            _usdValue = dataObj.rate;

            $("#btnCAD").removeClass("disabled");
            $("#currencyStatus").html("USD = " + _usdValue.toFixed(2) + " CAD");
        })
        .done(function () {
            //alert("second success");
        })
        .fail(function () {
            $("#currencyStatus").html("Currency not available");
        })
        .always(function () {
        });
    }
}

function toggleCurrency() {
    if (_usdValue === -1)
        return;
    
    if (_actualCurrency === "USD") {
        // Change currency to CAD
        _actualCurrency = "CAD";
        setCurrency();       

        $("#btnUSD").removeClass("disabled");
        $("#btnCAD").addClass("disabled");        
    }
    else {
        // Change currency to USD
        _actualCurrency = "USD";
        setCurrency();

        $("#btnUSD").addClass("disabled");
        $("#btnCAD").removeClass("disabled");
    }
}

function setCurrency() {
    if (_actualCurrency === "CAD") {
        $(".price").each(function () {
            var price = cleanPriceString($(this).html());
            var isComparer = $(this).hasClass("priceCompare");
            price = price * _usdValue;
            $(this).html(restorePriceString(price, isComparer));
        });
    }
    else {
        $(".price").each(function () {
            $(this).html($(this).data("originalprice"));
        });
    }
}

// Mode stuff
function updateMode() {
    if (_actualMode === "mtgprice") {
        $("#btnMtgPrice").addClass("disabled");
        $("#btnMtlStores").removeClass("disabled");

        // Show currency change options
        $("#currencyChange").show();
        
        // Show data source credits
        $("#dataSourceCredits").show();
    }
    else {
        $("#btnMtgPrice").removeClass("disabled");
        $("#btnMtlStores").addClass("disabled");

        // Hide currency change options
        $("#currencyChange").hide();

        // hdie data source credits
        $("#dataSourceCredits").hide();
    }
}

function toggleMode() {   
    if (_actualMode === "mtgprice") {
        // Change mode to MTL Stores
        _actualMode = "mtlstores";
        updateMode();
     
    }
    else {
        // Change mode to MTG Price
        _actualMode = "mtgprice";
        updateMode();
    }
}

// Price utils
function cleanPriceString(price) {
    var output = price.trim();
    output = output.replace(/\$/g, '');
    return output;
}

function restorePriceString(price, addComparer) {
    var output = price.toFixed(2);
    if (addComparer) {
        if (output > 0) {
            output = "+" + output;
        }

        if (output != 0) {
            output = output + " $";
        }
    } else {
        output = output + " $";
    }
    
    return output;
}

// Ripping methods
function RipPriceTKL(searchTermsInput) {
    var urlSearch = "http://" + window.location.host + "/ExternalAPI/GetPrice3KL?searchTerms=" + searchTermsInput;

    var request = $.get(urlSearch, function (data) {
        $("#priceTKL").html(data);
    })
    .done(function () {
        //alert("second success");
    })
    .fail(function () {
        $("#priceTKL").html("ERROR");
    })
    .always(function () {
    });
}

function RipPriceGK(searchTermsInput) {

}

function RipPriceF2F(searchTermsInput) {

}
