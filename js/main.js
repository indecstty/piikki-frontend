$(function () {

    // API URL
    const api_url = "https://indecs.fi/piikki";
  
    // Variables to store data
    let products;
    let product;
    let user;
    let admin_authorized = false;
  
    // Fetch products data from API
    $.getJSON(`${api_url}/products.php?callback=?`)
      .done(function (data) {
        products = data.products;
        generateAllProductsHTML(products);
      })
      .fail(function (jqxhr, textStatus, error) {
        $(".page").removeClass("visible");
        noInternet();
      });
  
    // Event listener for hashchange
    $(window).on('hashchange', function () {
      render(decodeURI(window.location.hash));
    });
  
    // Trigger hashchange event on page load
    $(window).trigger('hashchange');
  
    // Prevent enter key from submitting form
    $(window).on('keypress', function (event) {
      if (event.keyCode === 10 || event.keyCode === 13)
        event.preventDefault();
    });
  
    // Event listener for form submission
    $('form').on('submit', function (event) {
      event.preventDefault(); // Prevent default form submission behavior
  
      const cardId = $("#card_id").val();
  
      if (!cardId || !$.isNumeric(cardId)) {
        $(location).attr('href', 'index.html');
        return;
      }
  
      window.location.hash = 'products'; // Change the window location to the products page with the hash
    });

	function render(url) {

		// Get the keyword from the url.
		var temp = url.split('/')[0];

		// Hide whatever page is currently shown.
		$(".page").removeClass("visible");


		var map = {

			// The Homepage.
			'': function() {
				renderFrontPage();
			},

			'#products': function() {

				if( !$("#card_id").val() || !$.isNumeric($("#card_id").val()) ){
                    $(location).attr('href','index.html');
                    return;
                }
                
                $(".loader").addClass("visible");
                
                $.getJSON(api_url + "/user.php?callback=?", {
                    card_id: $("#card_id").val()
                }, {
                    dataType: "jsonp",  // Add dataType as jsonp
                    jsonpCallback: "callback"  // Replace "callback" with the actual name of the callback function returned by the server
                })
                .done(function(data){
                    $(".loader").removeClass("visible");
                    if(data.success){
                        user = data;
                        if(user.status == "new" || (user.first_name == "Etunimi" && user.last_name == "Sukunimi")){
                            window.location.hash = 'authorize';
                            return;
                        }
                        renderProductsPage(user);
                    } else{
                        var message = {};
                        message.text = data.text;
                        message.type = "error";
                        renderMessagePage(message);
                    }
                })
                .fail(function(jqxhr, textStatus, error){
                    $(".loader").removeClass("visible");
                    noInternet();
                });
                

				

			},

			// Single Products page.
			'#product': function() {
                
                if( !$("#card_id").val() || !$.isNumeric($("#card_id").val()) ){
                    $(location).attr('href','index.html');
                    return;
                }

				// Get the index of which product we want to show and call the appropriate function.
				var index = url.split('#product/')[1].trim();
                
                if(products.length){
                    $.each(products, function(idx, value){
                        if(value.id == index){
                            product = value;
                        }
                    });
                }
                
                renderSingleProductPage(index, product, user);
			},

			'#add': function() {
                if( !$("#card_id").val() || !$.isNumeric($("#card_id").val()) ){
                    $(location).attr('href','index.html');
                    return;
                }
                
                if( !$("#admin_id").val() || !$.isNumeric($("#admin_id").val()) ){
                    if(user.is_admin || admin_authorized){
                        renderAddFundsPage(user);
                        return;
                    }
                
                    window.location.hash = 'authorize';
                    return;
                }
                
                $(".loader").addClass("visible");
                
                $.getJSON( api_url + "/user.php?callback=?", {
                    card_id: $("#admin_id").val()
                })
                    .done(function(data){
                        $(".loader").removeClass("visible");
                        if(data.is_admin){
                            renderAddFundsPage(user);
                            return;
                        } else{
                            var message = {};
                            message.text = "Virheellinen kortti. / Invalid card.";
                            message.type = "error";
                            renderMessagePage(message);
                        }
                    })
                    .fail(function(jqxhr, textStatus, error){
                        $(".loader").removeClass("visible");
                        noInternet();
                    });
			},

			'#authorize': function() {
                if( !$("#card_id").val() || !$.isNumeric($("#card_id").val()) ){
                    $(location).attr('href','index.html');
                    return;
                }
                
                renderAuthorizePage();
			},
            
			'#buy': function() {
                if( !$("#card_id").val() || !$.isNumeric($("#card_id").val()) ){
                    $(location).attr('href','index.html');
                    return;
                }
                
				var count = $("#count").val();
                var product_id = product.id;
                var user_id = user.id;
                var message = {};
                $(".loader").addClass("visible");
                
                $.getJSON( api_url + "/buy.php?callback=?", {
                    count: count,
                    user_id: user_id,
                    product_id: product_id
                })
                    .done(function(data){
                        $(".loader").removeClass("visible");
                        if(data.success){
                            message.success = true;
                            message.text = "Kiitos ostoksesta! / Thank you for your purchase!";
                            renderMessagePage(message);
                        } else{
                            message.text = data.text;
                            message.type = "error";
                            renderMessagePage(message);
                        }
                    })
                    .fail(function(jqxhr, textStatus, error){
                        $(".loader").removeClass("visible");
                        noInternet();
                    });
			},
            
			'#process': function() {
                if( !$("#card_id").val() || !$.isNumeric($("#card_id").val()) ){
                    $(location).attr('href','index.html');
                    return;
                }
                
                var amount = $("#add-funds").val();
                var first_name = $("#first_name").val();
                var last_name = $("#last_name").val();
                var user_id = user.id;
                var is_admin = $("#is_admin").prop('checked') ? 1 : 0;
                var message = {};
                $(".loader").addClass("visible");
                
                $.getJSON( api_url + "/add-funds.php?callback=?", {
                    amount: amount,
                    user_id: user_id,
                    first_name: first_name,
                    last_name: last_name,
                    is_admin: is_admin
                })
                    .done(function(data){
                        $(".loader").removeClass("visible");
                        if(data.success){
                            message.text = "Saldoa lisätty! / Balance added!";
                            message.success = true;
                            renderMessagePage(message);
                        } else{
                            message.text = data.text;
                            message.type = "error";
                            renderMessagePage(message);
                        }
                    })
                    .fail(function(jqxhr, textStatus, error){
                        $(".loader").removeClass("visible");
                        noInternet();
                    });
			},

		};

		// Execute the needed function depending on the url keyword (stored in temp).
		if(map[temp]){
			map[temp]();
		}
		// If the keyword isn't listed in the above - render the error page.
		else {
			renderErrorPage();
		}

	}


	function generateAllProductsHTML(data){
        var list = $('.products .products-list');

        var theTemplateScript = $("#products-template").html();
        //Compile the template?
        var theTemplate = Handlebars.compile (theTemplateScript);
        list.append (theTemplate(data));

        list.find('li').on('click', function (e) {
            e.preventDefault();
            var productIndex = $(this).data('index');
            window.location.hash = 'product/' + productIndex;
        })
	}


	function renderFrontPage(){
		// Hides and shows products in the All Products Page depending on the data it recieves.
        
        var page = $('.frontpage');

        // Show the page itself.
        // (the render function hides all pages so we need to show the one we want).
        page.addClass('visible');
        
        $(window).on('click', function () {
        $("#card_id").focus();
        });
            
        $(window).on('keypress', function(event) {
        if (event.which === 13 || event.key === 'Enter') {
            // Pressed Enter key
            window.location.replace('#products');
        }
        });
    }

    function renderProductsPage(data) {
        // Hides and shows products in the All Products Page depending on the data it receives.
    
        var page = $('.products');
    
        if (data.success) {
            page.find('.name').text(data.first_name + " " + data.last_name);
            page.find('.funds').text(data.balance);
        } else {
            // If the API call is not successful, handle the error appropriately.
            var errorMessage = "Error: Unable to fetch user data.";
            // Display an error message on the page
            page.find('.error-message').text(errorMessage);
        }
    
        // Show the page itself.
        // (the render function hides all pages so we need to show the one we want).
        page.addClass('visible');
    }
    


	function renderSingleProductPage(index, data, user){
		// Shows the Single Product Page with appropriate data.
        
        var page = $('.single-product'),
        container = $('.product');

        page.find('.product h3').text(product.name);
        page.find('.product img').attr('src', product.image);
        page.find('#price').text(product.price);
        page.find('#total').text(product.price);
        
        page.find('.name').text(user.first_name + " " + user.last_name);
        page.find('.funds').text(user.balance);

        $(window).unbind("click");
        $(window).unbind("keypress");
        
        // Show the page.
        page.addClass('visible');
        
        checkFunds();
    }

	function renderErrorPage(){
        var page = $('.error');
        page.addClass('visible');
	}
	
    function renderMessagePage(message){
        var page = $('.message');
        var wait = 4000;
        if(!message.success){
            page.find('h1').text("Virhe / Error");
            wait = 5000;
        }
        page.find('p').text(message.text);
        page.addClass('visible');
        window.setTimeout(
            function() 
            {
                $(location).attr('href','index.html');
            }, wait);
	}
	
    function renderAddFundsPage(user){
        var page = $('.add-funds');
        page.find('#first_name').val(user.first_name);
        page.find('#last_name').val(user.last_name);
        if(user.is_admin){
            page.find('#is_admin').prop('checked', true);
        }
        page.find('.funds').text(user.balance);
        
        $(window).unbind("click");
        $(window).unbind("keypress");
        
        page.addClass('visible');
	}
	
    function renderAuthorizePage(message){
        $(window).click(function(){
            $("#admin_id").focus();
        });
        var page = $('.authorize');
        page.addClass('visible');
        $("#admin_id").focus();
        
        $(window).keypress(function(event){
        if (event.keyCode === 10 || event.keyCode === 13) 
            window.location.hash = '#add';
        });
	}

	
	function createQueryHash(filters){
		// Get the filters object, turn it into a string and write it into the hash.
        
        // Here we check if filters isn't empty.
    if(!$.isEmptyObject(filters)){
      // Stringify the object via JSON.stringify and write it after the '#filter' keyword.
      window.location.hash = '#filter/' + JSON.stringify(filters);
    }
    else{
      // If it's empty change the hash to '#' (the homepage).
      window.location.hash = '#';
    }
	}
    
    // Event listener for count slider
    $("#count").on('input', function () {
        checkFunds();
    });

    
    // Event listener for add-funds slider
    $("#add-funds").on('input', function () {
        $("#add-funds-value").text($("#add-funds").val());
    });
    
    // Function to check funds and enable/disable buy button
    function checkFunds(){
        $("#count-value").text($("#count").val());
        var total = $("#count").val() * $("#price").text();
        $("#total").text(total.toFixed(2));
        
        if(total > parseFloat($(".funds").html())){
            $(".buy-button").hide();
        } else{
            $(".buy-button").show();
        }
    }
    
  function noInternet() {
    const message = {
      text: "Yhteysvirhe. / Connection error.",
      success: false,
    };
    renderMessagePage(message);
  }
});