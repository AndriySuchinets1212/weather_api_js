(function($, document, window){
	
	$(document).ready(function() {

		// Cloning main navigation for mobile menu
		$(".mobile-navigation").append($(".main-navigation .menu").clone());

		// Mobile menu toggle 
		$(".menu-toggle").click(function () {
			$(".mobile-navigation").slideToggle();
		});

	})
})(jQuery, document, window);



const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
}

function success (pos) {
  const crd = pos.coords

  console.log('Your current position is:')
  console.log(`Latitude : ${crd.latitude}`)
  console.log(`Longitude: ${crd.longitude}`)
  console.log(`More or less ${crd.accuracy} meters.`)




  fetch(`${API_URL}/weather?lat=${crd.latitude}&lon=${crd.longitude}&appid=${APP_ID}&units=${UNITS}&lang=${LANGUAGE}`)
  		.then(response => response.json())
  		.then(data => {
        const date = moment.unix(data.dt).utc();
        const sunrise = moment.unix(data.dt).utc();
        const sunset = moment.unix(data.dt).utc();

        data.currentDate = date.format('DD.MM.YYYY');
        data.sunrise =  sunrise.format('HH:MM A');
        data.sunset =  sunset.format('HH:MM A');
        data.degree = Math.round(data.main.temp);

        // data.duration = sunset.diff(sunrise).format('HH:MM A')
        console.log(sunset.diff(sunrise))
        console.log(data)
        currentWeatherBlock(data)
  			setInputSearch(data)
  		});

  fetch(`${API_URL}/find?lat=${crd.latitude}&lon=${crd.longitude}&appid=${APP_ID}&units=${UNITS}&lang=${LANGUAGE}&cnt=4`)
    .then(response => response.json())
    .then(data => nearbyPlaces(data.list));
  let forecastDays = {};
  let forecastHours = [];

  fetch(`${API_URL}/forecast?lat=${crd.latitude}&lon=${crd.longitude}&appid=${APP_ID}&units=${UNITS}&lang=${LANGUAGE}`)
    .then(response => response.json())
    .then((data) => {


      data.list.forEach((item) => {
        const date = moment.unix(item.dt).utc()
        const day = date.format('d');

        item.hour = moment.unix(item.dt).format('HH:MM A')
        item.tempRound = Math.round(item.main.temp);
        item.dayString = date.format('dddd');
        item.monthNumber = date.format('MMM DD');

        if (date.format('YYYYMMDD') == moment().format('YYYYMMDD')) {
          forecastHours.push(item)
        }
        if (forecastDays[day] === undefined) {
          forecastDays[day] = item;
        }
      })


      currentWeatherHoursBlock(forecastHours);
      currentWeatherDaysBlock({'list': Object.values(forecastDays)})

    })

}

function setInputSearch (data) {
  $('.find-location input[type="text"]').val(`${data.name}, ${data.sys.country}`)
}

function error (err) {
  console.warn(`ERROR(${err.code}): ${err.message}`)
}

navigator.geolocation.getCurrentPosition(success, error, options)

function nearbyPlaces (data) {
  const source = $('#nearby_places_block').html()
  const template = Handlebars.compile(source)
  $('#nearby_places_block_content').html(template({ 'list': data }))
}

function currentWeatherBlock (data) {
  const source = $('#current_weather_block').html()
  const template = Handlebars.compile(source)
  $('#current_weather_block_content').html(template(data))
}

function currentWeatherHoursBlock (data) {
  const source = $('#current_weather_hours_block').html()
  const template = Handlebars.compile(source)
  $('#current_weather_hours_block_content').html(template({'list': data}))
}

function currentWeatherDaysBlock (data) {
  const source = $('#current_weather_block_days').html()
  const template = Handlebars.compile(source)
  $('#current_weather_block_content').append(template(data))
}

function prepareConent (data, idScript, idBlock, isAppend = false) {
  const source = $(idScript).html()
  const template = Handlebars.compile(source)
  if(isAppend){
    $(idBlock).append(template(data))
  }else{
    $(idBlock).html(template(data))
  }
}

