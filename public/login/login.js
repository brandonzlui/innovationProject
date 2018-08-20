$(document).ready(function(){
  customInputLabelListener();
});

function login(bookingReference) {
  $.ajax({
    dataType: 'json',
    url: './login',
    method: 'POST',
    data: { 
      bookingReference: bookingReference
    },
    async: true,
    success: loginSuccess,
    error: loginError
  })
}

function loginSuccess(data, status, jqXHR) {
  if (!data.success) return
  localStorage.setItem('flightCode', data.flightCode)
  localStorage.setItem('flightSeat', data.flightSeat)
  redirect()
}

function loginError(jqXHR, status, error) {
  alert(error)
}

function redirect() {
  location.href = './index'
}

$('#login').submit(event => {
  event.preventDefault()

  login($('#bookingReference').val())
})

function customInputLabelListener() {
  $('#bookingReference').on("focus", function() {
    $('#bookingReferenceLabel').addClass("custom-label-focus");
  });
  $(".form-group-custom input").on("focusout", function() {
    if ($('#bookingReference').val() == "") {
      $('#bookingReferenceLabel').removeClass("custom-label-focus");
    }
  });
}