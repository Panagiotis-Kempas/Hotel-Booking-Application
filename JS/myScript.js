$(document).ready(function () {
    //Find Ids
    const searchField = $("#search-TextField");
    const submitBtn = $("#submit-reset");
    const checkInDate = $("#checkInDate");
    const checkOutDate = $("#checkOutDate");
    const roomsDrop = $("#rooms-DropDown");
    const maxPriceText = $("#MaxPrice");
    const priceRange = $("#price-Range");
    const propertyTypeDrop = $("#Property-Type-DropDown");
    const guestRatingDrop = $("#Guest-Rating-Dropdown");
    const hotelLocationDrop = $("#Hotel-Location-Dropdown");
    const moreFiltersDrop = $("#More-Filters-DropDown");
    const sortByDrop = $("#Sort-By-DropDown");
    const hotelsSection = $("#listing-hotels-section");
    const hotelsAuto = $("#hotelsAuto");
    //Variables for populationg Data
    var roomtypes = [];
    var hotels = [];
    var filteredhotels = [];
    var autocompleteNames = [];
    var MaxPrice;
    var PropertyTypes = [];
    var GuestRatings = [];
    var Locations = [];
    var Filters = [];
    //Variables for searching and Sorting
    var cityName;
    var price;
    var propertyType;
    var guestRating;
    var hotelLocation;
    var filters;
    var sortBy;
    $.ajax({
        type: "GET",
        url: "JSON/data.json",
        dataType: "json"
    }).done((data) => StartApplication(data))
        .fail((errorObject) => ShowErrorPage(errorObject));
    function StartApplication(data) {
        //====INITIALIZE DATA
        //----------------1 - Get Room Types -------------
        roomtypes = data[0].roomtypes.map(x => x.name);
        roomtypes.sort();
        //----------------2 - Get All Hotels -------------
        hotels = data[1].entries;
        //----------------3 - Get All Hotels Names -------------
        var hotelNames = hotels.map(x => x.hotelName);
        autocompleteNames = [...new Set(hotelNames)].sort();
        //----------------4 - Get Max Price -------------
        MaxPrice = hotels.reduce((a, b) => a.price > b.price ? a : b).price;
        //----------------5 - Get Available Property Types -------------
        var hotelTypes = hotels.map(x => x.rating);
        PropertyTypes = [...new Set(hotelTypes)];
        //----------------6 - Get Guest Ratings -------------
        var hotelGuestRatings = hotels.map(x => x.ratings.text);
        GuestRatings = [...new Set(hotelGuestRatings)];
        //----------------7 - Locations -------------
        var hotelLocations = hotels.map(x => x.city);
        Locations = [...new Set(hotelLocations)].sort();
        //----------------8 - Get Hotel Filters -------------
        var hotelFilters = hotels.map(x => x.filters.map(a => a.name)).join().split(",");
        Filters = [...new Set(hotelFilters)].sort();
        //--------------------CONSTRUCT DOM---------------------------------
        //---------------A1 - Populate Data for Search Autocomplete
        var autoCompleteElements = autocompleteNames.map(x => `<option value="${x}">`);
        hotelsAuto.append(autoCompleteElements);
        //---------------A2 - Populate Data for RoomTypes Dropdown----------
        var roomTypesElements = roomtypes.map(x => `<option value="${x}">${x}</option>`);
        roomsDrop.append(roomTypesElements);
        //---------------A3 - Populate Max Price Field----------------------
        maxPriceText.text(`max.$ ${MaxPrice}`);
        //---------------A4 - Populate Max Attribute Price in Input Range and Change Max Price----------------------
        priceRange.attr("max", MaxPrice).val(MaxPrice);
        priceRange.on("input", function () {
            maxPriceText.text(`max.$ ${$(this).val()}`);
        })
        //---------------A5 - Populate Property Types----------------------
        propertyTypeDrop.prepend("<option value=''>All</option>");
        for (let i = 0; i < PropertyTypes.length; i++) {
            switch (PropertyTypes[i]) {
                case 5: propertyTypeDrop.append(`<option value='${PropertyTypes[i]}'>⭐⭐⭐⭐⭐</option>`); break;
                case 4: propertyTypeDrop.append(`<option value='${PropertyTypes[i]}'>⭐⭐⭐⭐</option>`); break;
                case 3: propertyTypeDrop.append(`<option value='${PropertyTypes[i]}'>⭐⭐⭐</option>`); break;
                case 2: propertyTypeDrop.append(`<option value='${PropertyTypes[i]}'>⭐⭐</option>`); break;
                case 1: propertyTypeDrop.append(`<option value='${PropertyTypes[i]}'>⭐</option>`); break;
                default: break;
            }
        }
        //---------------A6 - Populate Guest Ratings----------------------
        guestRatingDrop.prepend("<option value=''>All</option>");
        for (let rating of GuestRatings) {
            rating == "Okey" ? guestRatingDrop.append(`<option value='${rating}'>Okay 0 - 2</option>`)
                : rating == "Fair" ? guestRatingDrop.append(`<option value='${rating}'>Fair 2 - 6</option>`)
                    : rating == "Good" ? guestRatingDrop.append(`<option value='${rating}'>Good 6 - 7</option>`)
                        : rating == "Very Good" ? guestRatingDrop.append(`<option value='${rating}'>Very Good 7 - 8.5</option>`)
                            : guestRatingDrop.append(`<option value='${rating}'>Excellent 8.5 - 10</option>`);
        }
        //---------------A7 - Populate Hotel Locations----------------------
        hotelLocationDrop.prepend("<option value=''>All</option>");
        var LocationElements = Locations.map(x => `<option value='${x}'>${x}</option>`);
        hotelLocationDrop.append(LocationElements);
        //---------------A8 - Populate Filters----------------------
        moreFiltersDrop.prepend("<option value=''>All</option>");
        moreFiltersDrop.append(Filters.map(x => `<option value='${x}'>${x}</option>`));
        //==========================ADD EVENT LISTENERS (INPUT LOGIC)=================
        searchField.on('input', function () {
            cityName = $(this).val();
            Controller();
        });
        priceRange.on('input', function () {
            price = $(this).val();
            Controller();
        });
        propertyTypeDrop.on('input', function () {
            propertyType = $(this).val();
            Controller();
        });
        guestRatingDrop.on('input', function () {
            guestRating = $(this).val();
            Controller();
        });
        hotelLocationDrop.on('input', function () {
            hotelLocation = $(this).val();
            Controller();
        });
        moreFiltersDrop.on('input', function () {
            filters = $(this).val();
            Controller();
        });
        sortByDrop.on('input', function () {
            sortBy = $(this).val();
            Controller();
        });
        submitBtn.on('click', function () {
            searchField.val() = "";
            priceRange.val() = "";
            propertyTypeDrop.val() = "";
            guestRatingDrop.val() = "";
            hotelLocationDrop.val() = "";
            moreFiltersDrop.val() = "";
            Controller();
        });
        //========================== CONTROLLER =====================================
        Controller();
        function Controller() {
            filteredhotels = hotels;
            //Filtering....
            if (cityName) {
                filteredhotels = filteredhotels.filter(x => x.hotelName.toUpperCase().includes(cityName.toUpperCase()))
            }
            if (price) {
                filteredhotels = filteredhotels.filter(x => x.price <= price);
            }
            if (propertyType) {
                filteredhotels = filteredhotels.filter(x => x.rating == propertyType);
            }
            if (guestRating) {
                filteredhotels = filteredhotels.filter(x => x.ratings.text == guestRating);
            }
            if (guestRating) {
                filteredhotels = filteredhotels.filter(x => x.ratings.text == guestRating);
            }
            if (hotelLocation) {
                filteredhotels = filteredhotels.filter(x => x.city == hotelLocation);
            }
            if (filters) {
                filteredhotels = filteredhotels.filter(x => x.filters.some(y => y.name == filters))
            }
            //Sorting....
            if (sortBy) {
                switch (sortBy) {
                    case "nameAsc": filteredhotels.sort((a, b) => a.hotelName < b.hotelName ? -1 : 1); break;
                    case "nameDesc": filteredhotels.sort((a, b) => a.hotelName > b.hotelName ? -1 : 1); break;
                    case "cityAsc": filteredhotels.sort((a, b) => a.city < b.city ? -1 : 1); break;
                    case "cityDesc": filteredhotels.sort((a, b) => a.city > b.city ? -1 : 1); break;
                    case "priceAsc": filteredhotels.sort((a, b) => a.price - b.price); break;
                    case "priceDesc": filteredhotels.sort((a, b) => b.price - a.price); break;
                    default: filteredhotels.sort((a, b) => a.hotelName < b.hotelName ? -1 : 1); break;
                }
            }
            //View
            hotelsSection.empty();
            if (filteredhotels.length > 0) {
                filteredhotels.forEach(ViewHotels);
            }
            else {
                ViewNoMoreHotels();
            }
        }
        //========================= VIEW ======================
        function ViewHotels(hotel) {
            var element = `
            <div class="hotel-card">
                <div class="photo" style="background: url('${hotel.thumbnail}'); background-position: center">
                    <i class="fa fa-heart"></i>
                    <span>1/30</span>
                </div>
                <div class="details">
                    <h3>${hotel.hotelName}</h3>
                    <div class="rating" style="display:inline;">
                        <div>
                            ${RatingStars(hotel.rating)}
                            <i>Hotel</i>
                        </div>
                    </div>
                    <div class="location">
                        ${hotel.city},0.2 Miles to Champs Elysees
                    </div>
                    <div class="reviews">
                        <span class="total">${hotel.ratings.no.toFixed(1)}</span>
                        <b>${hotel.ratings.text}</b>
                        <small>(1736)</small>
                    </div>
                    <div class="location-reviews">
                        Excellent location <small>(9.2/10)</small>
                    </div>
                </div>
                <div class="third-party-prices">
                    <div class="sites-and-prices">
                        <div class="highlited">
                            Hotel website
                            <strong>$706</strong>
                        </div>
                        <div>
                            Agoda
                            <strong>$575</strong>
                        </div>
                        <div>
                            Travelocity
                            <strong>$708</strong>
                        </div>
                    </div>
                    <div class="more-deals">
                        <strong>More deals from</strong>
                        <strong>$575</strong>
                    </div>
                </div>
                <div class="call-to-action">
                    <div class="price">
                        <div class="before-discount">
                            HotelPower.com
                            <strong><s>$ ${(hotel.price * 1.1).toFixed(0)}</s></strong>
                        </div>
                        <div class="after-discount">
                            Travelocity
                            <strong>$ ${hotel.price}</strong>
                            <div class="total">
                                3 nights for <strong>$ ${hotel.price * 3}</strong>
                            </div>
                        </div>
                        <div class="usp">
                            ${hotel.filters.map(x => `<span>${x.name + " "}</span>`)}
                        </div>
                        <div class="button">
                            <a href="#">View Deal</a>
                        </div>
                    </div>
                </div>
            </div> `;
            hotelsSection.append(element);
        };
        function RatingStars(rating) {
            var eles = "";
            for (var i = 0; i < rating; i++) {
                eles += `<span class="fa fa-star"></span>` + " ";
            }
            return eles;
        };
        function ViewNoMoreHotels() {
            var noMoreHotelsElement = "<br/><h3>No hotels were hound with these search criteria</h3>";
            hotelsSection.append(noMoreHotelsElement);
        }
    }
    function ShowErrorPage(errorObject) {
        if (errorObject.status == 200) {
            var IS_JSON = true;
            try {
                var json = $.parseJSON(errorObject.responseText);
            } catch (err) {
                IS_JSON = false;
                var noMoreHotelsElement = `<br/><h3>Not Valis JSON Format </h3>`;
            }
        }
        else {
            var noMoreHotelsElement = `<br/><h3>${errorObject.status} -- ${errorObject.statusText}</h3>`;
        }
        hotelsSection.append(noMoreHotelsElement);
    }
})