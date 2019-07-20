// Providers

function createProvider(provider)
{
    let root = document.createElement("div");
    root.classList.add("provider");
    let logo = document.createElement("div");
    logo.classList.add("provider-logo");
    if(provider.backColor)
        logo.style.backgroundColor = provider.backColor;
    let logoImg = document.createElement("img");
    let providerImage = (provider.image) ? provider.image : "generic_provider";
    logoImg.src = "../../../assets/" + providerImage + ".svg";
    logoImg.classList.add("provider-logo-img");
    logo.appendChild(logoImg);
    root.appendChild(logo);
    let desc = document.createElement('div');
    desc.classList.add('provider-desc');
    let descTitle = document.createElement('div');
    descTitle.classList.add('provider-desc-title');
    descTitle.innerText = provider.title;
    desc.appendChild(descTitle);
    let descSubTitle = document.createElement('div');
    descSubTitle.classList.add('provider-desc-subtitle');
    descSubTitle.innerText = Homey.__("country_" + provider.country);
    desc.appendChild(descSubTitle);
    root.appendChild(desc);
    root.onclick = function() {
        Homey.showLoadingOverlay();
        Homey.emit( 'select_provider', provider.id, function( err, result ) {
            Homey.nextView();
        });
    }
    return root;
}

function initSelectProvider()
{
    Homey.showLoadingOverlay();
    Homey.setTitle("Select data provider");
    let root = document.getElementById("providers-container");
    Homey.emit( 'get_providers', null, function( err, result ) {
        for(i = 0; i < result.length; ++i) {
            root.appendChild(createProvider(result[i]))
        }
        Homey.hideLoadingOverlay();
    });
}

// Stops

function createStop(stop) {
    let root = document.createElement("div");
    root.classList.add("stop");
    let logo = document.createElement("img");
    logo.classList.add("stop-logo");
    logo.src = "../assets/icon.svg"
    root.appendChild(logo);
    let desc = document.createElement('div');
    desc.classList.add('stop-desc');
    let descTitle = document.createElement('div');
    descTitle.classList.add('stop-desc-title');
    descTitle.innerText = stop.title;
    desc.appendChild(descTitle);
    root.appendChild(desc);
    root.onclick = function() {
        Homey.showLoadingOverlay();
        Homey.emit( 'select_stop', stop.id, function( err, result ) {
            Homey.nextView();
        });
    }
    return root;
}

function updateStops()
{
    Homey.emit( 'get_stops', document.getElementById("stops-search").value, function( err, result ) {
        let root = document.getElementById("stops-container");
        while (root.firstChild) {
            root.removeChild(root.firstChild);
        }
        for(i = 0; i < result.length; ++i) {
            root.appendChild(createStop(result[i]))
        }
        Homey.hideLoadingOverlay();
    });
}

function initSelectStop()
{
    Homey.showLoadingOverlay();
    Homey.setTitle("Select a stop");
    updateStops();
    $("#stops-search").keyup(delay(updateStops, 500));
}

// Tracks

function createTrack(stop)
{
    let root = document.createElement("div");
    root.classList.add("stop");
    let logo = document.createElement("img");
    logo.classList.add("stop-logo");
    logo.src = "../../../assets/marker.svg"
    root.appendChild(logo);
    let desc = document.createElement('div');
    desc.classList.add('stop-desc');
    let descTitle = document.createElement('div');
    descTitle.classList.add('stop-desc-title');
    descTitle.innerText = stop.track;
    desc.appendChild(descTitle);
    root.appendChild(desc);
    root.onclick = function() {
        Homey.showLoadingOverlay();
        Homey.emit( 'select_track', stop.id, function( err, result ) {
            Homey.nextView();
        });
    }
    return root;
}

function initSelectTrack()
{
    Homey.showLoadingOverlay();
    Homey.setTitle("Select a track or position");
    Homey.emit( 'get_tracks', null, function( err, result ) {
        if(result.length == 0) {
            Homey.nextView();
        } else {
            let root = document.getElementById("tracks-container");
            while (root.firstChild) {
                root.removeChild(root.firstChild);
            }
            root.appendChild(createTrack({track:Homey.__("all_tracks")}))
            for(i = 0; i < result.length; ++i) {
                root.appendChild(createTrack(result[i]))
            }
            Homey.hideLoadingOverlay();
        }
    });
}

// Lines

var cbi = 0;
function createLine(line, all)
{
    let root = document.createElement("div");
    root.classList.add("line");
    let check = document.createElement("input");
    let id = "cb_" + (++cbi);
    check.id = id;
    check.type = "checkbox";
    check.value = line.title;
    check.classList.add("line-cb");
    if(all) check.classList.add("line-cb-all");
    else check.classList.add("line-cb-item");
    if(all) check.checked = true;
    root.appendChild(check);
    let desc = document.createElement('label');
    desc.htmlFor = id;
    desc.innerText = line.title;
    desc.classList.add('line-desc');
    root.appendChild(desc);
    if(all) {
        check.onclick = function() {
            $(".line-cb-item").prop("checked", false);
            Homey.emit( 'select_lines', '')
        }
    } else {
        check.onclick = function() {
            $(".line-cb-all").prop("checked", false);
            var checkedVals = $('.line-cb-item:checkbox:checked').map(function() {
                return this.value;
            }).get();
            Homey.emit( 'select_lines', checkedVals.join(","));
        }
    }
    return root;
}

function initSelectLines()
{
    Homey.showLoadingOverlay();
    Homey.setTitle("Select line(s) to include");
    Homey.emit( 'get_lines', null, function( err, result ) {
        if(result.length == 0) {
            Homey.nextView();
        } else {
            Homey.hideLoadingOverlay();
            let root = document.getElementById("lines-container");
            while (root.firstChild) {
                root.removeChild(root.firstChild);
            }
            root.appendChild(createLine({title:Homey.__("all_lines")}, true))
            for(i = 0; i < result.length; ++i) {
                root.appendChild(createLine(result[i]))
            }
        }
    });
}

// Utility functions

function delay(callback, ms)
{
    var timer = 0;
    return function() {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
        callback.apply(context, args);
        }, ms || 0);
    };
}