function addToLocalStorage(lsKey, data) {
    if (localStorage.getItem(lsKey) !== null) {
        var lsText = localStorage.getItem(lsKey);
        var lsJson = JSON.parse(lsText);
        lsJson.push(data);
        localStorage.setItem(lsKey, JSON.stringify(lsJson));
    }
    else {
        var lsText = JSON.stringify(data);
        var lsJson = JSON.parse(lsText);
        localStorage.setItem(lsKey, JSON.stringify(lsJson));
    }
}

/**
 * Parses the incoming XML to a JSON object using the xml2sjon library.
 * (/js/xml2json.min.js).
 * 
 * @param {type} xml    
 * @returns             json object
 */
function parseJson(xml) {
    var x2js = new X2JS();
    var json = x2js.xml_str2json(xml);
    return json;
}

/**
 * Changes the format of a date to yyyy-mm-dd. This format is needed to pass 
 * the date to the webservice. To get the month, we need to add 1 to 
 * date.getMonth() because January is 0;
 * If the day or month has only 1 digit, a zero
 * is added to get a two digit day or month.
 * 
 * @param {type} date       The date as date object.
 * @returns {String}        The date as string in the right format.
 */
function formatDate(date) {
    var dd = date.getDate();
    var mm = date.getMonth() + 1;
    var yyyy = date.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    date = yyyy + '-' + mm + '-' + dd;
    return date;
}

/**
 * 
 * @param {type} date
 * @returns {Date|String|formatShowDate.newDate}
 */
function formatShowDate(date) {
    var newDate = new Date(date);
    var dayNames = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
    var monthNames = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
    newDate = dayNames[newDate.getDay()] + " " + newDate.getDate() + " " + monthNames[newDate.getMonth()];
    return newDate;
}


function pageTransition(from) {
    var homePage = document.getElementById("tranistion");
    homePage.className = "heightPercent view-animate-" + (from === "next" ? "next" : "prev");
    console.log(homePage);
}
